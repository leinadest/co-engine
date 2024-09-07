'use client';

import { useEffect, useState } from 'react';

import Skeleton from '@/components/skeletons/Skeleton';
import Friend from '@/app/(main)/home/(main)/(connections)/_components/Friend';
import useFriends from '@/features/friends/hooks/useFriends';
import { snakeToCamel } from '@/utils/helpers';
import SkeletonList from '@/components/skeletons/SkeletonList';
import SkeletonFriend from '@/app/(main)/home/(main)/(connections)/_components/SkeletonFriend';
import List from '@/components/common/List';
import Search from '@/components/Search';

export default function AllFriends() {
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { data, error, refetch, fetchMore } = useFriends({
    variables: { search: debouncedSearch },
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    refetch({ search: debouncedSearch });
  }, [refetch, debouncedSearch]);

  useEffect(() => {
    if (error) throw error;
  }, [error, data]);

  if (!data) {
    return (
      <main className="flex flex-col min-h-0">
        <Search
          setDebouncedSearch={setDebouncedSearch}
          placeholder="Search friends"
        />
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

  const friends = data.edges.map((edge) => snakeToCamel(edge.node));

  return (
    <main className="flex flex-col min-h-0">
      <Search
        setDebouncedSearch={setDebouncedSearch}
        placeholder="Search friends"
      />
      <List
        top={<h5 className="text-center">All Friends ({data.totalCount})</h5>}
        item={Friend}
        data={friends}
        onEndReached={fetchMore}
        className="mx-auto max-w-screen-lg"
      />
    </main>
  );
}
