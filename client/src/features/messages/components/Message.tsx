import Link from 'next/link';
import { useState } from 'react';

import Avatar from '@/components/Avatar';
import { formatTime } from '@/utils/helpers';

export interface MessageProps {
  id: string;
  creator: {
    id: string;
    username: string;
    discriminator: string;
    profilePicUrl: string;
  };
  createdAt: Date;
  editedAt?: Date;
  content: string;
  reactions: Array<{
    reactorId: string;
    reaction: string;
  }>;
}

export default function Message({
  id,
  creator,
  createdAt,
  editedAt,
  content,
  reactions,
}: MessageProps) {
  const [showDiscriminator, setShowDiscriminator] = useState(false);

  const timestamp = editedAt
    ? `Edited at ${formatTime(editedAt)}`
    : formatTime(createdAt);

  return (
    <div className="flex px-2 gap-4">
      <Link href={`/home/user/${creator.id}`} className="shrink-0">
        <Avatar
          src={creator.profilePicUrl}
          defaultSrc={'/person.png'}
          alt="user"
        />
      </Link>
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-4">
          <Link href={`/home/user/${creator.id}`}>
            <h6
              onMouseOver={() => setShowDiscriminator(true)}
              onMouseLeave={() => setShowDiscriminator(false)}
            >
              {creator.username}
              {showDiscriminator && (
                <span className="font-normal">#{creator.discriminator}</span>
              )}
            </h6>
          </Link>
          <p className="text-sm">{timestamp}</p>
        </div>
        <p className="text-sm break-words">{content}</p>
      </div>
    </div>
  );
}
