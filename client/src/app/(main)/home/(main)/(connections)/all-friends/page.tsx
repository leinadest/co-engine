'use client';

import { useEffect, useState } from 'react';

import Skeleton from '@/components/skeletons/Skeleton';
import Friend, { FriendProps } from '@/features/friends/components/Friend';
import useFriends from '@/features/friends/hooks/useFriends';
import { snakeToCamel } from '@/utils/helpers';
import SkeletonList from '@/components/skeletons/SkeletonList';
import SkeletonFriend from '@/features/friends/components/SkeletonFriend';
import List from '@/components/common/List';
import useUserUpdated from '@/features/users/hooks/useUserUpdated';

export default function AllFriends() {
  const { data, error, fetchMore } = useFriends({
    fetchPolicy: 'cache-and-network',
  });
  const [friends, setFriends] = useState<any[]>([]);

  useEffect(() => {
    if (error) throw error;
    if (!data) return;
    setFriends(data.edges.map((edge) => snakeToCamel(edge.node)));
  }, [error, data]);

  const userUpdatedSub = useUserUpdated({
    variables: { userIds: friends.map((friend) => friend.id) },
  });

  useEffect(() => {
    if (!userUpdatedSub.data) return;
    const updatedFriend = snakeToCamel(userUpdatedSub.data);
    setFriends((oldFriends) =>
      oldFriends.map((friend) =>
        friend.id === updatedFriend.id ? updatedFriend : friend
      )
    );
  }, [userUpdatedSub.data]);

  if (!data) {
    return (
      <main className="min-h-0">
        <SkeletonList
          top={
            <Skeleton type="h5" className="mt-4 mb-2 shrink-0 mx-auto w-40" />
          }
          skeleton={<SkeletonFriend />}
          className="mx-auto p-2 max-w-screen-lg"
        />
      </main>
    );
  }

  return (
    <main className="min-h-0">
      <List
        top={
          <h5 className="mt-4 mb-2 text-center">
            All Friends ({data.totalCount})
          </h5>
        }
        item={Friend}
        data={friends}
        onEndReached={fetchMore}
        className="mx-auto p-2 max-w-screen-lg"
      />
    </main>
  );
}
