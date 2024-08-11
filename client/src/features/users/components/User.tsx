import Image from 'next/image';
import Link from 'next/link';

interface UserProps {
  profilePic?: string;
  username: string;
}

export default function User({ profilePic, username }: UserProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-bgSecondary">
      <div className="profile-circle">
        <Image src="/connections.png" alt="home" width={26} height={26} />
      </div>
      <p className="grow">{username}</p>
      <Link
        href="/home/settings"
        className="p-1 rounded-md focus:bg-bgSecondaryDark hover:bg-bgSecondaryDark"
      >
        <Image src="/settings.png" alt="settings" width={26} height={26} />
      </Link>
    </div>
  );
}
