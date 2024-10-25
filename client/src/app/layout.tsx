import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';

import './globals.css';

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
    <html lang="en" className={cookies().get('theme')?.value}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
