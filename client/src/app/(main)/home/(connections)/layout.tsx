'use client';

import TrackerLink from '@/components/TrackerLink';
import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {}, [pathname]);

  const navMap = {
    All: 'all-friends',
    Online: 'online-friends',
    Pending: 'friend-requests',
    Blocked: 'blocked',
    'Add Friends': 'add-friends',
  } as const;

  const optionsList = Object.keys(navMap).map((option) => {
    const optionHref = `/home/${navMap[option as keyof typeof navMap]}`;
    const optionClassName = pathname.includes(optionHref)
      ? 'btn-minimal brightness-95 dark:brightness-150'
      : 'btn-minimal';
    return (
      <li key={option}>
        <TrackerLink href={optionHref} className={optionClassName}>
          {option}
        </TrackerLink>
      </li>
    );
  });

  return (
    <div className="flex flex-col min-w-[480px]">
      <nav className="p-4 border-b border-b-border dark:border-b-border-dark">
        <ul className="flex justify-evenly items-center">{optionsList}</ul>
      </nav>
      {children}
    </div>
  );
}
