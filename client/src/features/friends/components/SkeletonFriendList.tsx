import SkeletonFriend from './SkeletonFriend';

export default function SkeletonFriendList() {
  return (
    <ul>
      {Array.from({ length: 10 }, (_, i) => (
        <li key={i}>
          <SkeletonFriend />
        </li>
      ))}
    </ul>
  );
}
