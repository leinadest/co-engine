'use client';

import Link from 'next/link';

export default function Layout({ children }: { children: React.ReactNode }) {
  const listLinks = ['Account', 'Profile', 'Preferences'].map((item) => {
    const href = `/home/settings/${item.toLowerCase()}`;
    const className = `focus-by-brighten ${
      href === window.location.pathname ? 'underline' : ''
    }`;
    return (
      <li key={item}>
        <Link href={href} className={className}>
          {item}
        </Link>
      </li>
    );
  });
  return (
    <div className="grid grid-cols-[200px_1fr] bg-bgSecondary">
      <div className="p-4 text-center">
        <h5>Settings</h5>
        <hr className="border-t-2" />
        <nav>
          <ol className="*:mb-1">{listLinks}</ol>
        </nav>
        <hr className="border-t-2" />
        <button className="focus-by-brighten">Log out</button>
      </div>
      {children}
    </div>
  );
}
