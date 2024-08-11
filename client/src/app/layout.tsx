import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';
import Header from '@/components/common/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Co-Engine',
  description: 'Co-Engine is a platform for connecting with others.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
