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
    <div className="grid grid-rows-[64px_minmax(0,1fr)]">
      <nav className="flex overflow-x-auto overflow-y-clip p-4 border-b border-b-border dark:border-b-border-dark">
        <ul className="grow self-center flex justify-evenly items-center min-w-[450px]">
          {optionsList}
        </ul>
      </nav>
      {children}
    </div>
  );
}
