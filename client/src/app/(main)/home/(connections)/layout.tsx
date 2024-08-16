'use client';

import TrackerLink from '@/components/TrackerLink';
import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {}, [pathname]);

  const options = {
    All: 'all-friends',
    Online: 'online-friends',
    Pending: 'friend-requests',
    Blocked: 'blocked',
  } as const;

  const optionsList = Object.keys(options).map((option) => {
    const optionHref = `/home/${options[option as keyof typeof options]}`;
    const optionClassName = pathname.includes(optionHref)
      ? 'btn-minimal brightness-95'
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
    <div className="flex flex-col min-w-[420px]">
      <ul className="flex justify-evenly items-center p-2 border-b">
        {optionsList}
        <li>
          <button className="btn-minimal">Add Friend</button>
        </li>
      </ul>
      {children}
    </div>
  );
}
