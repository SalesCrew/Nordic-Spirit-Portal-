"use client";
import Link from 'next/link';
import { useRef, useState } from 'react';
import { User2 } from 'lucide-react';
import CustomerLogin from './CustomerLogin';

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
        <CustomerLogin onClose={() => setShowCustomerLogin(false)} />
      )}
    </header>
  );
}


