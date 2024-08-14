import Image from 'next/image';

export interface MessageProps {
  id: string;
  creator: {
    id: string;
    username: string;
    profilePic: string;
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
  const timestamp = formattedEditedAt
    ? `Edited at ${formattedEditedAt}`
    : formattedCreatedAt;

  return (
    <div className="flex px-2 gap-4">
      <div className="shrink-0 profile-circle">
        <Image
          src="/connections.png"
          alt="profile pic"
          width={26}
          height={26}
        />
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex gap-4">
          <h6>{creator.username}</h6>
          <p className="text-sm">{timestamp}</p>
        </div>
        <div className="text-sm">{content}</div>
      </div>
    </div>
  );
}
