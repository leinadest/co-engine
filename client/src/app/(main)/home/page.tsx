'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';

export default function Home() {
  useEffect(() => {
    const lastPath = localStorage.getItem('lastPath');
    const currentPath = window.location.pathname;
    if (lastPath && lastPath !== currentPath) {
      redirect(lastPath);
    }
  }, []);

  return (
    <main>
      <p className="my-auto text-center">...</p>
    </main>
  );
}
