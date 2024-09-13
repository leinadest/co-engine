'use client';

import AuthStorage from '@/features/auth/stores/authStorage';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function OAuth2({ searchParams }: any) {
  const { accessToken, expiresAt } = searchParams;

  useEffect(() => {
    if (!accessToken || !expiresAt) {
      redirect('/login');
    }

    AuthStorage.setAccessToken(accessToken);
    AuthStorage.setExpiresAt(expiresAt);

    redirect('/home');
  }, [accessToken, expiresAt]);
}
