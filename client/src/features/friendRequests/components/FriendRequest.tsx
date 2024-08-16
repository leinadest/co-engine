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
  const incoming = userId === receiver.id;

  const otherUser = incoming ? sender : receiver;
  const tag = incoming ? 'Incoming Friend Request' : 'Outgoing Friend Request';

  return (
    <div className="flex items-center gap-2 p-2">
      <div className="profile-circle"></div>
      <div className="mr-auto">
        <h5>{otherUser.username}</h5>
        <p>{tag}</p>
      </div>
      {incoming && (
        <button className="rounded-full size-8 bg-bgSecondary focus-by-brightness">
          ✓
        </button>
      )}
      <button className="rounded-full size-8 bg-bgSecondary focus-by-brightness">
        ✕
      </button>
    </div>
  );
}