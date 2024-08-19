import Image from 'next/image';
import TrackerLink from '@/components/TrackerLink';

export interface FriendProps {
  id: string;
  username: string;
  discriminator: string;
  lastLoginAt: string;
  isOnline: boolean;
  profilePic: string;
}

export default function Friend({
  id,
  username,
  discriminator,
  lastLoginAt,
  isOnline,
  profilePic,
}: FriendProps) {
  return (
    <div className="flex items-center gap-2 p-2">
      <div className="profile-circle"></div>
      <div className="mr-auto">
        <h5>{username}</h5>
        <p>{isOnline ? 'Online' : 'Offline'}</p>
      </div>
      <TrackerLink
        href={`/home/chat?userId=${id}`}
        className="p-2 rounded-lg bg-bgPrimary focus-by-brightness"
      >
        <Image
          src="/chat_bubble.png"
          alt="chat bubble"
          width={26}
          height={26}
        />
      </TrackerLink>
    </div>
  );
}
