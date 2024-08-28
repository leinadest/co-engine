import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function SettingsSideBar({ className }: { className?: string }) {
  const pathname = usePathname();
  useEffect(() => {}, [pathname]);

  const listLinks = ['Account', 'Profile', 'Preferences'].map((item) => {
    const href = `/home/settings/${item.toLowerCase()}`;
    const className = `focus-by-brighten ${
      href === pathname ? 'underline' : ''
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
    <div className={className + ' p-4 text-center bg-bgSecondary'}>
      <h5>Settings</h5>
      <hr className="border-t-2" />
      <nav>
        <ol className="*:mb-1">{listLinks}</ol>
      </nav>
      <hr className="border-t-2" />
      <button className="focus-by-brighten">Log out</button>
    </div>
  );
}
