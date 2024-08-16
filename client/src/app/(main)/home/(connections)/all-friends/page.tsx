'use client';

import Skeleton from '@/components/skeletons/Skeleton';
import { FriendProps } from '@/features/friends/components/Friend';
import FriendList from '@/features/friends/components/FriendList';
import SkeletonFriendList from '@/features/friends/components/SkeletonFriendList';
import useFriends from '@/features/friends/hooks/useFriends';
import { snakeToCamel } from '@/utils/helpers';

export default function AllFriends() {
  const { data, loading, error } = useFriends();

  if (error) {
    throw error;
  }

  if (loading || data === undefined) {
    return (
      <main className="p-2 pt-4 overflow-auto">
        <Skeleton type="h5" className="mx-auto w-40" />
        <SkeletonFriendList />
      </main>
    );
  }

  const friends = data.friends.edges.map((edge) =>
    snakeToCamel(edge.node)
  ) as FriendProps[];

  return (
    <main className="p-2 pt-4 overflow-auto">
      <h5 className="text-center">All Friends ({friends.length})</h5>
      <FriendList friends={friends} />
    </main>
  );
}
