'use client';

import { useEffect } from 'react';

import useMe from '@/features/users/hooks/useMe';
import { snakeToCamel } from '@/utils/helpers';
import ProfileForm from './ProfileForm';
import SkeletonProfileForm from './SkeletonProfileForm';

export default function ProfilePage() {
  const { data, error } = useMe();

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  const me = snakeToCamel(data);

  return (
    <main className="relative p-4 pt-[60px] min-w-96 bg-bgPrimary shade-top before:inset-x-4 before:rounded-b-2xl">
      {me ? <ProfileForm me={me} /> : <SkeletonProfileForm />}
    </main>
  );
}
