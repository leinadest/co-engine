import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="flex items-center px-8 py-4 gap-4">
      <Link href="/" className="mr-auto">
        <Image src="/logo.svg" alt="logo" width={168} height={50} />
      </Link>
      <Link href="/signup" className="text-textPrimary hover:text-inherit">
        Sign Up
      </Link>
      <Link href="/login" className="text-textPrimary hover:text-inherit">
        Login
      </Link>
    </header>
  );
}
