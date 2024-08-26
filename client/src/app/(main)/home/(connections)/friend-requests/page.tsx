'use client';

import List from '@/components/common/List';
import Skeleton from '@/components/skeletons/Skeleton';
import SkeletonList from '@/components/skeletons/SkeletonList';
import FriendRequest from '@/features/friendRequests/components/FriendRequest';
import SkeletonFriendRequest from '@/features/friendRequests/components/SkeletonFriendRequest';
import useFriendRequests from '@/features/friendRequests/hooks/useFriendRequests';
import useMe from '@/features/users/hooks/useMe';
import { snakeToCamel } from '@/utils/helpers';
import { useEffect, useState } from 'react';

export default function FriendRequests() {
  const meQuery = useMe();
  const incomingRequestsQuery = useFriendRequests({
    variables: {
      type: 'received',
    },
  });
  const outgoingRequestsQuery = useFriendRequests({
    variables: {
      type: 'sent',
    },
  });
  const [filter, setFilter] = useState<'received' | 'sent'>('received');

  useEffect(() => {
    if (
      meQuery.error ||
      incomingRequestsQuery.error ||
      outgoingRequestsQuery.error
    ) {
      throw (
        meQuery.error ||
        incomingRequestsQuery.error ||
        outgoingRequestsQuery.error
      );
    }
  }, [meQuery.error, incomingRequestsQuery.error, outgoingRequestsQuery.error]);

  if (
    !meQuery.data ||
    !incomingRequestsQuery.data ||
    !outgoingRequestsQuery.data
  ) {
    return (
      <>
        <div className="flex justify-evenly items-center p-4 bg-bgSecondary">
          <Skeleton type="h5" className="w-56" />
          <Skeleton type="h5" className="w-56" />
        </div>
        <main className="overflow-auto">
          <SkeletonList skeleton={<SkeletonFriendRequest />} className="p-2" />
        </main>
      </>
    );
  }

  const totalCountIncoming = incomingRequestsQuery.data.totalCount;
  const totalCountOutgoing = outgoingRequestsQuery.data.totalCount;

  const filteredQuery =
    filter === 'received' ? incomingRequestsQuery : outgoingRequestsQuery;
  const friendRequests = filteredQuery.data?.edges.map(({ node }) =>
    snakeToCamel({ ...node, userId: meQuery.data?.id })
  );

  return (
    <>
      <div className="flex justify-evenly items-center p-2 bg-bgSecondary">
        <button
          onClick={() => setFilter('received')}
          className={`btn-minimal bg-inherit ${
            filter === 'received' && 'brightness-95'
          }`}
        >
          Incoming Requests ({totalCountIncoming})
        </button>
        <button
          onClick={() => setFilter('sent')}
          className={`btn-minimal bg-inherit ${
            filter === 'sent' && 'brightness-95'
          }`}
        >
          Outgoing Requests ({totalCountOutgoing})
        </button>
      </div>
      <main className="min-h-0">
        <List
          item={FriendRequest}
          data={friendRequests as any[]}
          getKey={({ sender, receiver }) => `${sender.id}${receiver.id}`}
          onEndReached={filteredQuery.fetchMore}
          className="p-2"
        />
      </main>
    </>
  );
}
