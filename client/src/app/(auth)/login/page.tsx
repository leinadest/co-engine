import LogInForm from '@/features/auth/components/LogInForm';
import Link from 'next/link';

export const metadata = {
  title: 'Login',
  description: 'Login page',
};

export default function Login({ searchParams }: any) {
  return (
    <>
      <main className="mx-auto p-8 max-w-sm">
        <h1 className="text-center mb-4 text-2xl">Login</h1>
        <LogInForm />
        <div className="flex items-center gap-2 my-4">
          <hr className="w-full border-textSecondary" />
          <p className="w-fit whitespace-nowrap">or continue with</p>
          <hr className="w-full border-textSecondary" />
        </div>
        <Link href={`${process.env.NEXT_PUBLIC_API_URL}/auth/discord`}>
          <button className="btn w-full">Discord</button>
        </Link>
      </main>
    </>
  );
}
