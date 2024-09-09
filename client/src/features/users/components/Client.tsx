import Avatar from '@/components/Avatar';
import Image from 'next/image';
import Link from 'next/link';

export interface ClientProps {
  me: any;
}

export default function Client({ me }: ClientProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-bgSecondary dark:bg-bgSecondary-dark">
      <Link href="/home/settings/profile">
        <Avatar
          src={me.profilePicUrl}
          defaultSrc={'/person.png'}
          className="bg-bgSecondaryDark dark:bg-bgSecondaryDark-dark"
          status={'online'}
        />
      </Link>
      <p className="grow truncate">{me.displayName}</p>
      <Link
        href="/home/settings/account"
        className="p-2 rounded-md bg-inherit focus-by-brightness"
      >
        <Image
          src="/settings.png"
          alt="settings"
          width={26}
          height={26}
          className="min-w-[26px] min-h-[26px]"
        />
      </Link>
    </div>
  );
}
