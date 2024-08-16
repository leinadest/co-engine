import Friend, { FriendProps } from './Friend';

interface FriendListProps {
  friends: FriendProps[];
}

export default function FriendList({ friends }: FriendListProps) {
  return (
    <ul>
      {friends.map((friend) => (
        <li key={friend.id}>
          <Friend {...friend} />
        </li>
      ))}
    </ul>
  );
}
