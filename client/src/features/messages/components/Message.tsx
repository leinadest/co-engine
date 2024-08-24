import ProfilePic from '@/components/users/ProfilePic';
import Link from 'next/link';
import { useState } from 'react';

export interface MessageProps {
  id: string;
  creator: {
    id: string;
    username: string;
    discriminator: string;
    profilePicUrl: string;
  };
  formattedCreatedAt: string;
  formattedEditedAt?: string;
  content: string;
  reactions: Array<{
    reactorId: string;
    reaction: string;
  }>;
}

export default function Message({
  id,
  creator,
  formattedCreatedAt,
  formattedEditedAt,
  content,
  reactions,
}: MessageProps) {
  const [showDiscriminator, setShowDiscriminator] = useState(false);

  const timestamp = formattedEditedAt
    ? `Edited at ${formattedEditedAt}`
    : formattedCreatedAt;

  return (
    <div className="flex px-2 gap-4">
      <Link href={`/home/user/${creator.id}`} className="shrink-0">
        <ProfilePic
          src={creator.profilePicUrl}
          defaultSrc={'/person.png'}
          alt="user"
        />
      </Link>
      <div className="flex flex-col gap-1">
        <div className="flex gap-4">
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
        <div className="text-sm">{content}</div>
      </div>
    </div>
  );
}
