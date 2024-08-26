import Avatar from '@/components/Avatar';

export interface BlockProps {
  blockedUser: {
    id: string;
    username: string;
    discriminator: string;
    profilePicUrl: string;
  };
  createdAt: Date;
}

export default function Block({
  blockedUser: { id, username, discriminator, profilePicUrl },
  createdAt,
}: BlockProps) {
  return (
    <div className="flex items-center gap-2 p-2">
      <Avatar src={profilePicUrl} defaultSrc={'/person.png'} alt="block" />
      <h5>
        {username}#{discriminator}
      </h5>
      <button className="ml-auto rounded-full size-8 bg-bgSecondary focus-by-brightness">
        ✕
      </button>
    </div>
  );
}
