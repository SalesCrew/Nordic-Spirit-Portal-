"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function CustomerLoginPage() {
	const router = useRouter();
	const supabase = supabaseBrowser();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);
		
		try {
			// Check if user exists in customer_users table
			const { data: customerUser, error: queryError } = await supabase
				.from('customer_users')
				.select('id, email, is_active')
				.eq('email', email)
				.eq('is_active', true)
				.single();
			
			if (queryError) {
				console.error('Query error:', queryError);
				setError('Access denied. Please contact your administrator.');
				setLoading(false);
				return;
			}
			
			if (!customerUser) {
				setError('Access denied. Please contact your administrator.');
				setLoading(false);
				return;
			}
			
			// For now, accept any password for valid customer emails
			// Store customer session info
			sessionStorage.setItem('customer_user', JSON.stringify(customerUser));
			router.replace('/customer');
		} catch (err: any) {
			console.error('Customer login error:', err);
			setError('Access denied. Please contact your administrator.');
			setLoading(false);
		}
	}

	return (
		<main className="container-padded py-10 max-w-sm mx-auto">
			<h1 className="text-xl font-semibold mb-4">Login</h1>
			<form onSubmit={onSubmit} className="card p-4 space-y-3">
				<div>
					<label className="label">Email</label>
					<input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
				</div>
				<div>
					<label className="label">Password</label>
					<input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
				</div>
				{error && <div className="text-sm text-red-600">{error}</div>}
				<div className="flex justify-end pt-2">
					<button className="btn-gradient" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
				</div>
			</form>
		</main>
	);
}
