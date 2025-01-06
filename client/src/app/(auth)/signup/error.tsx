'use client';

import SignUpForm from '@/features/auth/components/SignUpForm';
import { formatError } from '@/utils/api';

export default function ErrorPage({ error }: { error: any }) {
  return (
    <>
      <div className="p-4 text-center bg-warning">
        <p>{formatError(error).message}</p>
      </div>
      <main className="flex-col-center mx-auto p-8 max-w-sm *:w-full">
        <h1 className="text-center mb-4 text-2xl">Signup</h1>
        <SignUpForm formValues={error.formValues} />
        <div className="flex items-center gap-2 my-4">
          <hr className="w-full border-textSecondary" />
          <p className="w-fit whitespace-nowrap">or continue with</p>
          <hr className="w-full border-textSecondary" />
        </div>
        <button className="btn">Discord</button>
      </main>
    </>
  );
}
