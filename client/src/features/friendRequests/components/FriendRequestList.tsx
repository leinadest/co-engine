import FriendRequest, { FriendRequestProps } from './FriendRequest';

interface FriendRequestListProps {
  userId: string;
  friendRequests: Omit<FriendRequestProps, 'userId'>[];
}

export default function FriendRequestList({
  userId,
  friendRequests,
}: FriendRequestListProps) {
  return (
    <ul>
      {friendRequests.map((friendRequest) => {
        const key = `${friendRequest.sender.id}${friendRequest.receiver.id}`;
        return (
          <li key={key}>
            <FriendRequest userId={userId} {...friendRequest} />
          </li>
        );
      })}
    </ul>
  );
}
