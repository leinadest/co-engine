'use client';

import AuthStorage from '@/features/auth/stores/authStorage';
import { redirect } from 'next/navigation';

export default function OAuth2({ searchParams }: any) {
  const { accessToken, expiresAt } = searchParams;

  if (!accessToken) {
    return <h1>Invalid accessToken</h1>;
  }

  if (!expiresAt) {
    return <h1>Invalid expiresAt</h1>;
  }

  AuthStorage.setAccessToken(accessToken);
  AuthStorage.setExpiresAt(expiresAt);

  redirect('/home');
}
