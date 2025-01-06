'use client';

import { formatError } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(error);
  }

  const [code, setCode] = useState('Unknown Error');
  const [message, setMessage] = useState(
    'An unexpected error occurred. Please try again later.'
  );
  const router = useRouter();

  useEffect(() => {
    const errorData = formatError(error);
    setCode(errorData.code);
    setMessage(errorData.message);
  }, [error, router]);

  return (
    <div className="flex-col-center justify-center w-full min-h-screen">
      <h1>{code}</h1>
      <p className="mt-4 mb-8">{message}</p>
      <div>
        <button onClick={() => reset()} className="btn mr-2">
          Try again
        </button>
        <button onClick={() => router.push('/home')} className="btn">
          Return to Home
        </button>
      </div>
    </div>
  );
}
