"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isCustomerLoggedIn } from '@/lib/customer-auth';

export default function CustomerAuthWrapper({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const authenticated = isCustomerLoggedIn();
    setIsAuthenticated(authenticated);
    
    if (!authenticated) {
      router.replace('/customer-login');
    }
  }, [router]);

  if (isAuthenticated === null) {
    return <div className="container-padded py-10 text-center text-gray-500">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
