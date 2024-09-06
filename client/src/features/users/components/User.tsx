import Avatar from '@/components/Avatar';
import Image from 'next/image';
import Link from 'next/link';

export interface UserProps {
  me: any;
}

export default function User({ me }: UserProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-bgSecondary dark:bg-bgSecondary-dark">
      <Link href="/home/settings/profile">
        <Avatar
          src={me.profilePicUrl}
          defaultSrc={'/person.png'}
          className="bg-bgSecondaryDark dark:bg-bgSecondaryDark-dark"
          status={'online'}
        />
      </Link>
      <p className="grow">{me.displayName}</p>
      <Link
        href="/home/settings"
        className="p-1 rounded-md bg-inherit focus-by-brightness"
      >
        <Image src="/settings.png" alt="settings" width={26} height={26} />
      </Link>
    </div>
  );
}
