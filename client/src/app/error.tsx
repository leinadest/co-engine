'use client';

import { APIError } from '@/types/api';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const { message, code } = error.cause as APIError;
  const cleanMessage =
    process.env.NODE_ENV === 'production' ? 'Something went wrong' : message;

  const router = useRouter();

  useEffect(() => {
    const { code } = error.cause as APIError;
    switch (code) {
      case 'UNAUTHENTICATED':
        router.replace('/login');
        break;
    }
  }, [error, router]);

  return (
    <div className="flex-col-center justify-center w-full min-h-screen">
      <h1>{code}</h1>
      <p className="mt-4 mb-8">{message}. Please try again.</p>
      <button onClick={() => reset()} className="btn">
        Try again
      </button>
    </div>
  );
}
