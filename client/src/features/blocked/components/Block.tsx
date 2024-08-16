export interface BlockProps {
  id: string;
  username: string;
  discriminator: string;
  profilePic: string;
}

export default function Block({
  id,
  username,
  discriminator,
  profilePic,
}: BlockProps) {
  return (
    <div className="flex items-center gap-2 p-2">
      <div className="profile-circle"></div>
      <h5>
        {username}#{discriminator}
      </h5>
      <button className="ml-auto rounded-full size-8 bg-bgSecondary focus-by-brightness">
        ✕
      </button>
    </div>
  );
}
