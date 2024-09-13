'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import TrackerLink from '@/components/TrackerLink';
import Avatar from '@/components/Avatar';
import useUserUpdated from '@/features/users/hooks/useUserUpdated';
import { snakeToCamel } from '@/utils/helpers';
import DeleteFriendshipBtn from './DeleteFriendshipBtn';

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
  const [data, setData] = useState({
    username,
    discriminator,
    displayName,
    isOnline,
    profilePicUrl,
  });

  const userUpdatedSub = useUserUpdated({
    variables: { userIds: [id] },
  });

  useEffect(() => {
    if (!userUpdatedSub.data) return;
    const updatedFriend = snakeToCamel(userUpdatedSub.data);
    setData((prevData) => ({ ...prevData, ...updatedFriend }));
  }, [userUpdatedSub.data]);

  const [showName, setShowName] = useState(false);

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <Link href={`/home/user/${id}`}>
        <Avatar
          src={data.profilePicUrl}
          defaultSrc={'/person.png'}
          alt="friend"
          status={data.isOnline ? 'online' : 'offline'}
        />
      </Link>

      <div className="mr-auto">
        <Link
          href={`/home/user/${id}`}
          onMouseOver={() => setShowName(true)}
          onMouseLeave={() => setShowName(false)}
        >
          <h5>
            {data.displayName}
            {showName && (
              <span className="ml-2 font-normal">
                {data.username}#{data.discriminator}
              </span>
            )}
          </h5>
        </Link>
        <p>{data.isOnline ? 'Online' : 'Offline'}</p>
      </div>

      <DeleteFriendshipBtn friendId={id} friendDisplayName={data.displayName} />

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
