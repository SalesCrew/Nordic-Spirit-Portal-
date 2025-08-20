import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Nordic Spirit Portal',
  description: 'Photos and reporting portal for promoters',
  manifest: '/site.webmanifest'
};

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen antialiased text-gray-900">
        <Header />
        <div className="pt-2">{children}</div>
      </body>
    </html>
  );
}


