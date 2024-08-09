'use client';

import LogInForm from '@/features/auth/components/LogInForm';

export default function ErrorPage({ error }: { error: any }) {
  return (
    <>
      <div className="p-4 text-center bg-warning">
        <p>{error.message}</p>
      </div>
      <main className="flex-col-center mx-auto p-8 max-w-sm *:w-full">
        <h1 className="text-center mb-4 text-2xl">Login</h1>
        <LogInForm formValues={error.formValues} />
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
