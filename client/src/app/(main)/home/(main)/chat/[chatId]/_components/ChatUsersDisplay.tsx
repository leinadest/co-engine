import { useContext, useEffect } from 'react';

import { ChatContext } from '../_providers/ChatContextProvider';
import useUsers from '@/features/users/hooks/useUsers';
import List from '@/components/common/List';
import SkeletonList from '@/components/skeletons/SkeletonList';
import User from '@/features/users/components/User';
import { snakeToCamel } from '@/utils/helpers';
import SkeletonUser from '@/features/users/components/SkeletonUser';
import Skeleton from '@/components/skeletons/Skeleton';
import { twMerge } from 'tailwind-merge';

export default function ChatUsersDisplay({
  className,
}: {
  className?: string;
}) {
  const { chatId } = useContext(ChatContext);
  const { data, error, fetchMore } = useUsers({
    variables: { contextType: 'chat', contextId: chatId },
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (error) throw error;
  }, [data, error]);

  if (!data) {
    return (
      <SkeletonList
        top={
          <div className="py-5 bg-bgSecondary">
            <Skeleton type="h5" className="mx-auto w-40" />
          </div>
        }
        skeleton={<SkeletonUser />}
      />
    );
  }

  const users = snakeToCamel(data.edges.map(({ node: user }) => user));

  return (
    <List
      top={<h5 className="py-5 text-center">Users in Chat ({users.length})</h5>}
      item={User}
      data={users}
      onEndReached={fetchMore}
      className={twMerge('flex flex-col size-full bg-bgSecondary', className)}
    />
  );
}
