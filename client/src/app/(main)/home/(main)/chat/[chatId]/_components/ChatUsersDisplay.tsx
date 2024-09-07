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

export default function ChatUsersDisplay({
  className,
}: {
  className?: string;
}) {
  const { chatId } = useContext(ChatContext);
  const [debouncedSearch, setDebouncedSearch] = useState('');

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

  if (!data) {
    return (
      <div className="flex flex-col bg-bgSecondary">
        <Search
          setDebouncedSearch={setDebouncedSearch}
          placeholder="Search users"
          className="first:*:bg-bgPrimary"
        />
        <SkeletonList
          top={
            <div className="py-5 bg-bgSecondary">
              <Skeleton type="h5" className="mx-auto w-40" />
            </div>
          }
          skeleton={<SkeletonUser />}
        />
      </div>
    );
  }

  const users = snakeToCamel(data.edges.map(({ node: user }) => user));

  return (
    <div className="flex flex-col bg-bgSecondary">
      <Search
        setDebouncedSearch={setDebouncedSearch}
        placeholder="Search users"
        className="first:*:bg-bgPrimary"
      />
      <List
        top={
          <h5 className="py-2 text-center">Users in Chat ({users.length})</h5>
        }
        item={User}
        data={users}
        onEndReached={fetchMore}
        className={twMerge('flex flex-col size-full', className)}
      />
    </div>
  );
}
