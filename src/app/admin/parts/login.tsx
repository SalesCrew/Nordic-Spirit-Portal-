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
		
		// Hardcoded block for specific customer email (any variation of capitalization)
		if (email.toLowerCase() === 'anna-maria.schmidt@jti.com') {
			setMessage('Access denied. Customer accounts cannot access admin panel.');
			setLoading(false);
			return;
		}
		
		try {
		// Check if email exists in customer_users table (block if it does - case insensitive)
		const { data: customerUser } = await supabase
			.from('customer_users')
			.select('email')
			.ilike('email', email)
			.single();
			
			if (customerUser) {
				setMessage('Access denied. Customer accounts cannot access admin panel.');
				setLoading(false);
				return;
			}
			
			// Proceed with admin login
			const { error } = await supabase.auth.signInWithPassword({ email, password });
			if (error) setMessage(error.message);
			else setMessage('Logged in');
		} catch (err: any) {
			// If customer check fails, proceed with normal login (customer not found is OK)
			const { error } = await supabase.auth.signInWithPassword({ email, password });
			if (error) setMessage(error.message);
			else setMessage('Logged in');
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
					<button className="btn-gradient" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
				</div>
			</form>
			{message && <div className="text-xs text-gray-500 mt-2">{message}</div>}
			<div className="text-xs text-gray-400 mt-1">Press Ctrl+Shift+L to toggle</div>
		</div>
	);
}


