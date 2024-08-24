import ProfilePic from '@/components/users/ProfilePic';

export interface BlockProps {
  id: string;
  username: string;
  discriminator: string;
  profilePicUrl: string;
}

export default function Block({
  id,
  username,
  discriminator,
  profilePicUrl,
}: BlockProps) {
  return (
    <div className="flex items-center gap-2 p-2">
      <ProfilePic src={profilePicUrl} defaultSrc={'/person.png'} alt="block" />
      <h5>
        {username}#{discriminator}
      </h5>
      <button className="ml-auto rounded-full size-8 bg-bgSecondary focus-by-brightness">
        ✕
      </button>
    </div>
  );
}
