"use client";
import { useEffect, useState } from 'react';

export default function AdminLogin() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'l') setShow((s) => !s);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!show) return null;
  return (
    <div className="card p-4 mb-6">
      <div className="text-sm text-gray-600 mb-2">Admin login (placeholder)</div>
      <div className="grid grid-cols-2 gap-2">
        <input className="input" placeholder="Email" />
        <input className="input" placeholder="Password" type="password" />
      </div>
      <button className="btn-primary mt-3">Login</button>
      <div className="text-xs text-gray-400 mt-1">Press Ctrl+Shift+L to toggle</div>
    </div>
  );
}


