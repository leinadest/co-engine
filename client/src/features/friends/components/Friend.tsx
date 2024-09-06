import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import TrackerLink from '@/components/TrackerLink';
import Avatar from '@/components/Avatar';

export interface FriendProps {
  id: string;
  username: string;
  discriminator: string;
  displayName: string;
  lastLoginAt: string;
  isOnline: boolean;
  profilePicUrl: string;
}

export default function Friend({
  id,
  username,
  discriminator,
  displayName,
  lastLoginAt,
  isOnline,
  profilePicUrl,
}: FriendProps) {
  const [showName, setShowName] = useState(false);
  return (
    <div className="flex items-center gap-2 p-2">
      <Link href={`/home/user/${id}`}>
        <Avatar
          src={profilePicUrl}
          defaultSrc={'/person.png'}
          alt="friend"
          status={isOnline ? 'online' : 'offline'}
        />
      </Link>
      <div className="mr-auto">
        <Link
          href={`/home/user/${id}`}
          onMouseOver={() => setShowName(true)}
          onMouseLeave={() => setShowName(false)}
        >
          <h5>
            {displayName}
            {showName && (
              <span className="ml-2 font-normal">
                {username}#{discriminator}
              </span>
            )}
          </h5>
        </Link>
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
