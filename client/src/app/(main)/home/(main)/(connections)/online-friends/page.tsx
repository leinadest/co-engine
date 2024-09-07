'use client';

import List from '@/components/common/List';
import Skeleton from '@/components/skeletons/Skeleton';
import SkeletonList from '@/components/skeletons/SkeletonList';
import Friend from '@/app/(main)/home/(main)/(connections)/_components/Friend';
import SkeletonFriend from '@/app/(main)/home/(main)/(connections)/_components/SkeletonFriend';
import useFriends from '@/features/friends/hooks/useFriends';
import { snakeToCamel } from '@/utils/helpers';
import { useEffect, useState } from 'react';
import useUserUpdated from '@/features/users/hooks/useUserUpdated';
import Search from '@/components/Search';

export default function OnlineFriends() {
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { data, setData, error, refetch, fetchMore } = useFriends({
    variables: { status: 'online', search: debouncedSearch },
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    refetch({ search: debouncedSearch });
  }, [refetch, debouncedSearch]);

  const onlineFriends = data?.edges.map((edge) => snakeToCamel(edge.node));

  const userUpdated = useUserUpdated({
    variables: {
      userIds: onlineFriends
        ? onlineFriends.map(({ id }: { id: string }) => id)
        : [],
    },
  });

  useEffect(() => {
    const updatedFriend = snakeToCamel(userUpdated.data);
    if (!updatedFriend || updatedFriend.isOnline) return;

    setData((prevData) => {
      if (!prevData) return;
      const newEdges = prevData.edges.filter(
        ({ node: friend }: any) => friend.id !== updatedFriend.id
      );
      return { ...prevData, edges: newEdges };
    });
  }, [userUpdated.data, setData]);

  if (!data) {
    return (
      <main className="flex flex-col min-h-0">
        <Search
          setDebouncedSearch={setDebouncedSearch}
          placeholder="Search friends"
        />
        <SkeletonList
          top={<Skeleton type="h5" className="mx-auto w-40" />}
          skeleton={<SkeletonFriend />}
          className="mx-auto max-w-screen-lg"
        />
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-0">
      <Search
        setDebouncedSearch={setDebouncedSearch}
        placeholder="Search friends"
      />
      <List
        top={
          <h5 className="text-center">Online Friends ({data.totalCount})</h5>
        }
        item={Friend}
        data={onlineFriends}
        onEndReached={fetchMore}
        className="mx-auto max-w-screen-lg"
      />
    </main>
  );
}
