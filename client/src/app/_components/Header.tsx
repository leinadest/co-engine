import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="flex items-center px-8 py-4 gap-4">
      <Link href="/" className="flex items-center gap-2 mr-auto">
        <Image
          src="/logo.png"
          alt="logo"
          width={128}
          height={128}
          className="size-14"
        />
        <h2 className="font-normal">Co-Engine</h2>
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
