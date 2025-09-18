export function getCustomerUser() {
  if (typeof window === 'undefined') return null;
  try {
    const stored = sessionStorage.getItem('customer_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function isCustomerLoggedIn(): boolean {
  return getCustomerUser() !== null;
}

export function logoutCustomer() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('customer_user');
  }
}
