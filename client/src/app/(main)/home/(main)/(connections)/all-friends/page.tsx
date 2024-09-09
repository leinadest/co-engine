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

  const friends = data?.edges.map((edge) => snakeToCamel(edge.node));

  return (
    <>
      <Search
        setDebouncedSearch={setDebouncedSearch}
        placeholder="Search friends"
      />
      {data ? (
        <List
          top={<h5 className="text-center">All Friends ({data.totalCount})</h5>}
          item={Friend}
          data={friends}
          onEndReached={fetchMore}
          className="mx-auto max-w-screen-lg"
        />
      ) : (
        <SkeletonList
          top={
            <Skeleton type="h5" className="mt-4 mb-2 shrink-0 mx-auto w-40" />
          }
          skeleton={<SkeletonFriend />}
          className="mx-auto p-2 max-w-screen-lg"
        />
      )}
    </>
  );
}
