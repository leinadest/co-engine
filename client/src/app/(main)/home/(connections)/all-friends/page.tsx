'use client';

import { useEffect } from 'react';

import Skeleton from '@/components/skeletons/Skeleton';
import Friend, { FriendProps } from '@/features/friends/components/Friend';
import useFriends from '@/features/friends/hooks/useFriends';
import { snakeToCamel } from '@/utils/helpers';
import SkeletonList from '@/components/skeletons/SkeletonList';
import SkeletonFriend from '@/features/friends/components/SkeletonFriend';
import List from '@/components/common/List';

export default function AllFriends() {
  const { data, error, fetchMore } = useFriends();

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
          className="p-2"
        />
      </main>
    );
  }

  const friends = data.edges.map((edge) => snakeToCamel(edge.node));

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
        className="p-2"
      />
    </main>
  );
}
