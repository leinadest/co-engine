'use client';

import List from '@/components/common/List';
import Skeleton from '@/components/skeletons/Skeleton';
import SkeletonList from '@/components/skeletons/SkeletonList';
import Friend, { FriendProps } from '@/features/friends/components/Friend';
import SkeletonFriend from '@/features/friends/components/SkeletonFriend';
import useFriends from '@/features/friends/hooks/useFriends';
import { snakeToCamel } from '@/utils/helpers';
import { useEffect } from 'react';

export default function OnlineFriends() {
  const { data, error, fetchMore } = useFriends({
    variables: { status: 'online' },
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

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

  const totalCount = data.totalCount;
  const onlineFriends = data.edges.map((edge) => snakeToCamel(edge.node));

  return (
    <main className="min-h-0">
      <List
        top={
          <h5 className="mt-4 mb-2 text-center">
            Online Friends ({totalCount})
          </h5>
        }
        item={Friend}
        data={onlineFriends}
        onEndReached={fetchMore}
        className="mx-auto p-2 max-w-screen-lg"
      />
    </main>
  );
}
