"use client";
import Link from 'next/link';
import { useRef, useState } from 'react';
import { User2 } from 'lucide-react';

export default function Header() {
  const timer = useRef<number | null>(null);
  const [showCustomerLogin, setShowCustomerLogin] = useState(false);

  function handlePointerDown() {
    timer.current = window.setTimeout(() => {
      window.location.href = '/admin';
    }, 900);
  }

  function cancelPress() {
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="container-padded h-14 flex items-center justify-between">
        <div
          className="font-semibold tracking-tight select-none"
          onPointerDown={handlePointerDown}
          onPointerUp={cancelPress}
          onPointerCancel={cancelPress}
          onPointerLeave={cancelPress}
        >
          Nordic Spirit Portal
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCustomerLogin(true)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors opacity-50 hover:opacity-75"
            aria-label="Customer login"
          >
            JTI
          </button>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-opacity opacity-60 hover:opacity-100"
            aria-label="Admin login"
          >
            <User2 size={18} />
          </Link>
        </div>
      </div>
      {showCustomerLogin && (
        <CustomerLoginModal onClose={() => setShowCustomerLogin(false)} />
      )}
    </header>
  );
}

function CustomerLoginModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Accept any email/password for now
    setTimeout(() => {
      window.location.href = '/customer';
    }, 500);
  }

  return (
    <div className="fixed inset-0 z-[9999]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="card w-full max-w-sm p-4 bg-white relative z-[10000] shadow-2xl">
          <h3 className="text-lg font-semibold mb-3">Customer Login</h3>
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="label">Email</label>
              <input 
                className="input" 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input 
                className="input" 
                type="password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-gradient" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


