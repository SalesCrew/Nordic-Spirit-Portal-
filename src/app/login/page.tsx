"use client";
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
	const supabase = supabaseBrowser();
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);
		
		try {
			// Check if email exists in customer_users table (block if it does)
			const { data: customerUser } = await supabase
				.from('customer_users')
				.select('email')
				.eq('email', email)
				.single();
			
			if (customerUser) {
				setError('Access denied. Customer accounts cannot access admin panel.');
				setLoading(false);
				return;
			}
			
			// Proceed with admin login
			const { data, error } = await supabase.auth.signInWithPassword({ email, password });
			if (error) setError(error.message);
			else router.replace('/admin');
		} catch (err: any) {
			// If customer check fails, proceed with normal login (customer not found is OK)
			const { data, error } = await supabase.auth.signInWithPassword({ email, password });
			if (error) setError(error.message);
			else router.replace('/admin');
		}
		
		setLoading(false);
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
