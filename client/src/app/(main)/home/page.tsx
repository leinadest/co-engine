'use client';

import { redirect } from 'next/navigation';

export default function Home() {
  const lastPath = localStorage.getItem('lastPath');
  const currentPath = window.location.pathname;
  if (lastPath && lastPath !== currentPath) {
    redirect(lastPath);
  }

  return (
    <main>
      <p className="my-auto text-center">...</p>
    </main>
  );
}
