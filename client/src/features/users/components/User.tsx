import ProfilePic from '@/components/users/ProfilePic';
import Image from 'next/image';
import Link from 'next/link';

export interface UserProps {
  profilePicUrl?: string;
  username: string;
}

export default function User({ profilePicUrl, username }: UserProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-bgSecondary">
      <Link href="/home/settings/profile">
        <ProfilePic
          src={profilePicUrl}
          defaultSrc={'/person.png'}
          className="bg-bgSecondaryDark"
        />
      </Link>
      <p className="grow">{username}</p>
      <Link
        href="/home/settings/account"
        className="p-1 rounded-md bg-inherit focus-by-brightness"
      >
        <Image src="/settings.png" alt="settings" width={26} height={26} />
      </Link>
    </div>
  );
}
