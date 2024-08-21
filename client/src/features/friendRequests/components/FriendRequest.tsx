import Link from 'next/link';
import { useState } from 'react';

import useEndFriendRequest from '../hooks/useEndFriendRequest';

export interface FriendRequestProps {
  userId: string;
  sender: {
    id: string;
    username: string;
    discriminator: string;
    profilePic: string;
  };
  receiver: {
    id: string;
    username: string;
    discriminator: string;
    profilePic: string;
  };
  createdAt: string;
}

export default function FriendRequest({
  userId,
  sender,
  receiver,
  createdAt,
}: FriendRequestProps) {
  const [showDiscriminator, setShowDiscriminator] = useState(false);
  const { acceptFriendRequest, deleteFriendRequest } = useEndFriendRequest();

  const incoming = userId === receiver.id;
  const otherUser = incoming ? sender : receiver;
  const tag = incoming ? 'Incoming Friend Request' : 'Outgoing Friend Request';

  return (
    <div className="flex items-center gap-2 p-2">
      <Link
        href={`/home/user/${otherUser.id}`}
        className="profile-circle"
      ></Link>
      <div className="mr-auto">
        <Link
          href={`/home/user/${otherUser.id}`}
          onMouseOver={() => setShowDiscriminator(true)}
          onMouseLeave={() => setShowDiscriminator(false)}
        >
          <h5>
            {otherUser.username}
            {showDiscriminator && (
              <span className="font-normal">#{otherUser.discriminator}</span>
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
