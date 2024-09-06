import Link from 'next/link';

import Avatar from '@/components/Avatar';
import Image from 'next/image';
import useMe from '../hooks/useMe';
import { useEffect } from 'react';

export interface UserProps {
  id: string;
  displayName: string;
  profilePicUrl: string;
  isOnline: boolean;
}

export default function User({
  id,
  displayName,
  profilePicUrl,
  isOnline,
}: UserProps) {
  const { data: me, error } = useMe();

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  return (
    <div className="flex items-center gap-2 px-4 py-1 bg-bgSecondary dark:bg-bgSecondary-dark">
      <Link href={`/home/user/${id}`}>
        <Avatar
          src={profilePicUrl}
          defaultSrc={'/person.png'}
          className="bg-bgSecondaryDark dark:bg-bgSecondaryDark-dark"
          status={isOnline ? 'online' : 'offline'}
        />
      </Link>
      <Link href={`/home/user/${id}`} className="grow truncate">
        {displayName}
      </Link>
      {me?.id !== id && (
        <Link
          href={`/home/chat?userId=${id}`}
          className="p-2 rounded-md bg-inherit focus-by-brightness"
        >
          <Image
            src={'/chat_bubble.png'}
            alt="direct chat"
            width={26}
            height={26}
          />
        </Link>
      )}
    </div>
  );
}
