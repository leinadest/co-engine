export interface FriendProps {
  id: string;
  username: string;
  discriminator: string;
  lastLoginAt: string;
  isOnline: boolean;
  profilePic: string;
}

export default function Friend({
  id,
  username,
  discriminator,
  lastLoginAt,
  isOnline,
  profilePic,
}: FriendProps) {
  return (
    <div className="flex items-center gap-2 p-2">
      <div className="profile-circle"></div>
      <div>
        <h5>{username}</h5>
        <p>{isOnline ? 'Online' : 'Offline'}</p>
      </div>
    </div>
  );
}
