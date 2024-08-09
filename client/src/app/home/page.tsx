'use client';

import useUser from '@/features/users/hooks/useUser';
import { redirect } from 'next/navigation';

export default function Home() {
  const { data, error } = useUser();

  if (error?.message === 'Not authenticated') {
    redirect('/login');
  }

  return (
    <div>
      <h1>Home</h1>
      <p>{JSON.stringify(data, null, 2)}</p>
    </div>
  );
}
