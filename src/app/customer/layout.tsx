import CustomerAuthWrapper from './auth-wrapper';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <CustomerAuthWrapper>
      {children}
    </CustomerAuthWrapper>
  );
}
