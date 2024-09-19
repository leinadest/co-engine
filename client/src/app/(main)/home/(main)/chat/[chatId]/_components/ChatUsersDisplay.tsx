import { useContext, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { ChatContext } from '../_providers/ChatContextProvider';
import useUsers from '@/features/users/hooks/useUsers';
import List from '@/components/common/List';
import SkeletonList from '@/components/skeletons/SkeletonList';
import User from '@/features/users/components/User';
import { snakeToCamel } from '@/utils/helpers';
import SkeletonUser from '@/features/users/components/SkeletonUser';
import Skeleton from '@/components/skeletons/Skeleton';
import Search from '@/components/Search';
import CollapseWrapper from '@/components/wrappers/CollapseWrapper';

export default function ChatUsersDisplay({
  className,
}: {
  className?: string;
}) {
  const { chatId } = useContext(ChatContext);
  const [debouncedSearch, setDebouncedSearch] = useState<string>();

  const { data, error, refetch, fetchMore } = useUsers({
    variables: chatId
      ? { contextType: 'chat', contextId: chatId, search: debouncedSearch }
      : undefined,
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (error) throw error;
  }, [data, error]);

  useEffect(() => {
    refetch({ search: debouncedSearch });
  }, [refetch, debouncedSearch]);

  const users = snakeToCamel(data?.edges.map(({ node: user }) => user));

  return (
    <CollapseWrapper
      direction="right"
      expandedSize="min-w-60 max-w-60"
      btnClassName="top-16"
      className={twMerge('flex flex-col min-h-0 bg-bgSecondary', className)}
    >
      <Search
        setDebouncedSearch={setDebouncedSearch}
        placeholder="Search users"
        className="first:*:bg-bgPrimary dark:first:*:bg-bgPrimary-dark"
      />
      {data ? (
        <List
          top={
            <h5 className="py-2 pl-8 text-center">
              Users in Chat ({users.length})
            </h5>
          }
          item={User}
          data={users}
          onEndReached={fetchMore}
          className={twMerge('flex flex-col size-full', className)}
        />
      ) : (
        <SkeletonList
          top={<Skeleton type="h5" className="mx-auto py-2 w-40" />}
          skeleton={<SkeletonUser />}
        />
      )}
    </CollapseWrapper>
  );
}
