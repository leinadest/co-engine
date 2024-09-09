'use client';

import { useEffect } from 'react';

import useMe from '@/features/users/hooks/useMe';
import { snakeToCamel } from '@/utils/helpers';
import AccountForm from './_components/AccountForm';
import SkeletonAccountForm from './_components/SkeletonAccountForm';

export default function AccountPage() {
  const meQuery = useMe();

  useEffect(() => {
    if (meQuery.error) throw meQuery.error;
  }, [meQuery.error]);

  const me = snakeToCamel(meQuery.data);

  return (
    <main className="flex-1 flex flex-col mx-auto max-w-screen-lg p-4 bg-bgPrimary">
      <h1 className="my-4 text-center">Account</h1>
      {me ? (
        <AccountForm username={me.username} email={me.email} />
      ) : (
        <SkeletonAccountForm />
      )}
    </main>
  );
}
