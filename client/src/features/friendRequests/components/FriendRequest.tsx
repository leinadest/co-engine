import Link from 'next/link';
import { useState } from 'react';

import useEndFriendRequest from '../hooks/useEndFriendRequest';
import Avatar from '@/components/Avatar';

export interface FriendRequestProps {
  userId: string;
  sender: {
    id: string;
    username: string;
    discriminator: string;
    displayName: string;
    profilePicUrl: string;
  };
  receiver: {
    id: string;
    username: string;
    discriminator: string;
    displayName: string;
    profilePicUrl: string;
  };
  createdAt: string;
}

export default function FriendRequest({
  userId,
  sender,
  receiver,
  createdAt,
}: FriendRequestProps) {
  const [showName, setShowName] = useState(false);
  const { acceptFriendRequest, deleteFriendRequest } = useEndFriendRequest();

  const incoming = userId === receiver.id;
  const otherUser = incoming ? sender : receiver;
  const tag = incoming ? 'Incoming Friend Request' : 'Outgoing Friend Request';

  return (
    <div className="flex items-center gap-2 p-2">
      <Link href={`/home/user/${otherUser.id}`}>
        <Avatar
          src={otherUser.profilePicUrl}
          defaultSrc={'/person.png'}
          alt="user"
        />
      </Link>
      <div className="mr-auto">
        <Link
          href={`/home/user/${otherUser.id}`}
          onMouseOver={() => setShowName(true)}
          onMouseLeave={() => setShowName(false)}
        >
          <h5>
            {otherUser.displayName}
            {showName && (
              <span className="ml-2 font-normal">
                {otherUser.username}#{otherUser.discriminator}
              </span>
            )}
          </h5>
        </Link>
        <p>{tag}</p>
      </div>
      {incoming && (
        <button
          onClick={() => acceptFriendRequest(sender.id)}
          className="rounded-full size-8 bg-bgSecondary focus-by-brightness"
        >
          ✓
        </button>
      )}
      <button
        onClick={() => deleteFriendRequest(sender.id, receiver.id)}
        className="rounded-full size-8 bg-bgSecondary focus-by-brightness"
      >
        ✕
      </button>
    </div>
  );
}
