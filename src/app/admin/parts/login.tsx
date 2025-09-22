"use client";
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function AdminLogin() {
	const [show, setShow] = useState(false);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const supabase = supabaseBrowser();

	// Check if email matches blocked customer email (case-insensitive)
	const isCustomerEmail = email.toLowerCase() === 'anna-maria.schmidt@jti.com';

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'l') setShow((s) => !s);
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, []);

	async function onLogin(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setMessage(null);
		
		// ROBUST CHECK: Block if email exists in customer_users table (case-insensitive)
		console.log('Checking email:', email);
		
		// Check BOTH active and inactive customer users
		const { data: customerUsers, error: queryError } = await supabase
			.from('customer_users')
			.select('email, is_active')
			.ilike('email', email);
		
		console.log('Query result:', { customerUsers, queryError });
		
		// If query succeeded and found ANY matching users (active or not), BLOCK
		if (!queryError && customerUsers && customerUsers.length > 0) {
			console.log('BLOCKING: Found customer user');
			setMessage('Access denied. Customer accounts cannot access admin panel.');
			setLoading(false);
			return;
		}
		
		// Also check with trimmed and lowercase email
		const trimmedEmail = email.trim();
		const { data: customerUsers2 } = await supabase
			.from('customer_users')
			.select('email')
			.ilike('email', trimmedEmail);
			
		if (customerUsers2 && customerUsers2.length > 0) {
			console.log('BLOCKING: Found customer user (trimmed check)');
			setMessage('Access denied. Customer accounts cannot access admin panel.');
			setLoading(false);
			return;
		}
		
		// Only proceed with login if NOT a customer user
		const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
		if (loginError) {
			setMessage(loginError.message);
		} else {
			setMessage('Logged in');
		}
		
		setLoading(false);
	}

	if (!show) return null;
	return (
		<div className="card p-4 mb-6">
			<div className="text-sm text-gray-600 mb-2">Admin login</div>
			<form onSubmit={onLogin} className="grid grid-cols-2 gap-2">
				<input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
				<input className="input" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
				<div className="col-span-2 flex justify-end">
					<button 
						className={`btn-gradient ${isCustomerEmail ? 'opacity-30 cursor-not-allowed' : ''}`} 
						disabled={loading || isCustomerEmail}
						title={isCustomerEmail ? 'Customer accounts cannot access admin panel' : ''}
					>
						{loading ? 'Logging in...' : 'Login'}
					</button>
				</div>
			</form>
			{message && <div className="text-xs text-gray-500 mt-2">{message}</div>}
			{isCustomerEmail && <div className="text-xs text-red-500 mt-2">Customer accounts cannot access admin panel</div>}
			<div className="text-xs text-gray-400 mt-1">Press Ctrl+Shift+L to toggle</div>
		</div>
	);
}


