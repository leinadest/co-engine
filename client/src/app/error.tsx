'use client';

import { APIError } from '@/types/api';
import { ApolloError } from '@apollo/client';
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
    if (!(error instanceof ApolloError)) return;

    const { code } = error.cause as APIError;

    switch (code) {
      case 'UNAUTHENTICATED':
        setCode('Unauthorized');
        setMessage('You must be logged in to access this page.');
        router.replace('/login');
        break;
      case 'FORBIDDEN':
        setCode('Forbidden');
        setMessage('You do not have permission to access this page.');
        break;
      case 'NOT_FOUND':
        setCode('Not Found');
        setMessage('The requested resource was not found.');
        break;
    }

    if (code) return;

    if (error.networkError) {
      setCode('Network Error');
      setMessage(
        'An error occurred while making a network request. Please try again later.'
      );
    }
    if (error.graphQLErrors.length) {
      setCode('GraphQL Error');
      setMessage(
        'An error occurred while processing your GraphQL request. Please try again.'
      );
    }
    if (error.clientErrors.length) {
      setCode('Client Error');
      setMessage(
        'An error occurred while processing your request. Please try again.'
      );
    }
    if (error.protocolErrors.length) {
      setCode('Protocol Error');
      setMessage(
        'An error occurred while processing your request. Please try again later.'
      );
    }
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
