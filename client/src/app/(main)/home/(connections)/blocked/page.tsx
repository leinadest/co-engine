'use client';

import Skeleton from '@/components/skeletons/Skeleton';
import SkeletonList from '@/components/skeletons/SkeletonList';
import { BlockProps } from '@/features/blocked/components/Block';
import BlockList from '@/features/blocked/components/BlockList';
import SkeletonBlock from '@/features/blocked/components/SkeletonBlock';
import useBlocked from '@/features/blocked/hooks/useBlocked';
import { snakeToCamel } from '@/utils/helpers';

export default function Blocked() {
  const { data, loading, error } = useBlocked();

  if (error) {
    throw error;
  }

  if (loading || !data) {
    return (
      <main className="p-2 pt-4 overflow-auto">
        <Skeleton type="h5" className="mx-auto w-40" />
        <SkeletonList skeleton={<SkeletonBlock />} />
      </main>
    );
  }

  const blocks = data.blocked.edges.map((edge) => snakeToCamel(edge.node));

  return (
    <main className="p-2 pt-4 overflow-auto">
      <h5 className="text-center">Blocked ({blocks.length})</h5>
      <BlockList blocks={blocks as BlockProps[]} />
    </main>
  );
}
