'use client';

import { useEffect } from 'react';

import Skeleton from '@/components/skeletons/Skeleton';
import SkeletonList from '@/components/skeletons/SkeletonList';
import Block from '@/features/blocked/components/Block';
import SkeletonBlock from '@/features/blocked/components/SkeletonBlock';
import useUserBlocks from '@/features/blocked/hooks/useUserBlocks';
import { snakeToCamel } from '@/utils/helpers';
import List from '@/components/common/List';

export default function Blocked() {
  const { data, loading, error, fetchMore } = useUserBlocks({
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (error) throw error;
  }, [data, loading, error]);

  if (!data) {
    return (
      <main className="min-h-0">
        <SkeletonList
          top={<Skeleton type="h5" className="mx-auto mt-4 w-40" />}
          skeleton={<SkeletonBlock />}
          className="mx-auto p-2 max-w-screen-lg"
        />
      </main>
    );
  }

  const blocks = data.edges.map((edge) => snakeToCamel(edge.node));

  return (
    <main className="min-h-0">
      <List
        top={<h5 className="mt-4 text-center">Blocked ({data.totalCount})</h5>}
        item={Block}
        data={blocks}
        keyHandler={({ blockedUser }) => blockedUser.id}
        onEndReached={fetchMore}
        className="mx-auto p-2 max-w-screen-lg"
      />
    </main>
  );
}
