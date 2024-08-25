'use client';

import Skeleton from '@/components/skeletons/Skeleton';
import SkeletonList from '@/components/skeletons/SkeletonList';
import { FriendRequestProps } from '@/features/friendRequests/components/FriendRequest';
import FriendRequestList from '@/features/friendRequests/components/FriendRequestList';
import SkeletonFriendRequest from '@/features/friendRequests/components/SkeletonFriendRequest';
import useFriendRequests from '@/features/friendRequests/hooks/useFriendRequests';
import useMe from '@/features/users/hooks/useMe';
import { snakeToCamel } from '@/utils/helpers';
import { useEffect, useState } from 'react';

export default function AllFriends() {
  const meQuery = useMe();
  const incomingRequestsQuery = useFriendRequests('incoming', {
    fetchPolicy: 'no-cache',
  });
  const outgoingRequestsQuery = useFriendRequests('outgoing', {
    fetchPolicy: 'no-cache',
  });
  const [filter, setFilter] = useState<'incoming' | 'outgoing'>('incoming');

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
    meQuery.loading ||
    !meQuery.data ||
    incomingRequestsQuery.loading ||
    !incomingRequestsQuery.data ||
    outgoingRequestsQuery.loading ||
    !outgoingRequestsQuery.data
  ) {
    return (
      <>
        <div className="flex justify-evenly items-center p-4 bg-bgSecondary">
          <Skeleton type="h5" className="w-56" />
          <Skeleton type="h5" className="w-56" />
        </div>
        <main className="p-2 overflow-auto">
          <SkeletonList skeleton={<SkeletonFriendRequest />} />
        </main>
      </>
    );
  }

  const incomingResult = incomingRequestsQuery.data;
  const outgoingResult = outgoingRequestsQuery.data;

  const incomingRequests = incomingResult.data.map((friendRequest) =>
    snakeToCamel(friendRequest)
  );
  const outgoingRequests = outgoingResult.data.map((friendRequest) =>
    snakeToCamel(friendRequest)
  );

  const totalIncomingRequests = incomingResult.meta.totalCount;
  const totalOutgoingRequests = outgoingResult.meta.totalCount;

  return (
    <>
      <div className="flex justify-evenly items-center p-2 bg-bgSecondary">
        <button
          onClick={() => setFilter('incoming')}
          className={`btn-minimal bg-inherit ${
            filter === 'incoming' && 'brightness-95'
          }`}
        >
          Incoming Requests ({totalIncomingRequests})
        </button>
        <button
          onClick={() => setFilter('outgoing')}
          className={`btn-minimal bg-inherit ${
            filter === 'outgoing' && 'brightness-95'
          }`}
        >
          Outgoing Requests ({totalOutgoingRequests})
        </button>
      </div>
      <main className="p-2 overflow-auto">
        <FriendRequestList
          userId={meQuery.data.id}
          friendRequests={
            (filter === 'incoming'
              ? incomingRequests
              : outgoingRequests) as FriendRequestProps[]
          }
        />
      </main>
    </>
  );
}
