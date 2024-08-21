'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const lastPath = localStorage.getItem('lastPath');
    const currentPath = window.location.pathname;
    if (lastPath && lastPath !== currentPath) {
      router.replace(lastPath);
    }
  }, [router]);

  return (
    <main>
      <p className="my-auto text-center">...</p>
    </main>
  );
}
