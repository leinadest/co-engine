'use client';

import Link from 'next/link';

interface TrackerLinkProps {
  children: React.ReactNode;
  href: string;
  className?: string;
}

export default function TrackerLink({
  children,
  href,
  className,
}: TrackerLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => localStorage.setItem('lastPath', href)}
    >
      {children}
    </Link>
  );
}
