'use client';

import { useEffect, useState } from 'react';

import Skeleton from '@/components/skeletons/Skeleton';
import SkeletonList from '@/components/skeletons/SkeletonList';
import Block from '@/features/blocked/components/Block';
import SkeletonBlock from '@/features/blocked/components/SkeletonBlock';
import useUserBlocks from '@/features/blocked/hooks/useUserBlocks';
import { snakeToCamel } from '@/utils/helpers';
import List from '@/components/common/List';
import Search from '@/components/Search';

export default function Blocked() {
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { data, loading, error, refetch, fetchMore } = useUserBlocks({
    fetchPolicy: 'cache-and-network',
    variables: { search: debouncedSearch },
  });

  useEffect(() => {
    if (error) throw error;
  }, [data, loading, error]);

  useEffect(() => {
    refetch({ search: debouncedSearch });
  }, [refetch, debouncedSearch]);

  if (!data) {
    return (
      <main className="flex flex-col min-h-0">
        <input type="text" placeholder="Search blocked users" className="m-4" />
        <SkeletonList
          top={<Skeleton type="h5" className="mx-auto w-40" />}
          skeleton={<SkeletonBlock />}
          className="mx-auto max-w-screen-lg"
        />
      </main>
    );
  }

  const blocks = data.edges.map((edge) => snakeToCamel(edge.node));

  return (
    <main className="flex flex-col min-h-0">
      <Search
        setDebouncedSearch={setDebouncedSearch}
        placeholder="Search blocked users"
      />
      <List
        top={<h5 className="text-center">Blocked ({data.totalCount})</h5>}
        item={Block}
        data={blocks}
        keyHandler={({ blockedUser }) => blockedUser.id}
        onEndReached={fetchMore}
        className="mx-auto max-w-screen-lg"
      />
    </main>
  );
}
