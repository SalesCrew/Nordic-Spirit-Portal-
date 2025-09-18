"use client";
import { useState } from 'react';

export default function CustomerLogin({ onClose }: { onClose: () => void }) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<string | null>(null);

	async function onLogin(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setMessage(null);
		// Accept any email/password for now
		setTimeout(() => {
			window.location.href = '/customer';
		}, 500);
	}

	return (
		<div className="fixed inset-0 z-[9999]">
			<div className="absolute inset-0 bg-black/60" onClick={onClose} />
			<div className="absolute inset-0 flex items-center justify-center p-4">
				<div className="card p-4 bg-white relative z-[10000] shadow-2xl w-full max-w-sm">
					<div className="text-sm text-gray-600 mb-2">Customer login</div>
					<form onSubmit={onLogin} className="grid grid-cols-2 gap-2">
						<input 
							className="input" 
							placeholder="Email" 
							type="email"
							value={email} 
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
						<input 
							className="input" 
							placeholder="Password" 
							type="password" 
							value={password} 
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
						<div className="col-span-2 flex justify-end">
							<button className="btn-gradient" disabled={loading}>
								{loading ? 'Logging in...' : 'Login'}
							</button>
						</div>
					</form>
					{message && <div className="text-xs text-gray-500 mt-2">{message}</div>}
				</div>
			</div>
		</div>
	);
}
