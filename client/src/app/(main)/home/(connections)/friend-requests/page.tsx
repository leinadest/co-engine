'use client';

import Skeleton from '@/components/skeletons/Skeleton';
import SkeletonList from '@/components/skeletons/SkeletonList';
import { FriendRequestProps } from '@/features/friendRequests/components/FriendRequest';
import FriendRequestList from '@/features/friendRequests/components/FriendRequestList';
import SkeletonFriendRequest from '@/features/friendRequests/components/SkeletonFriendRequest';
import useFriendRequests from '@/features/friendRequests/hooks/useFriendRequests';
import useUser from '@/features/users/hooks/useUser';
import { snakeToCamel } from '@/utils/helpers';
import { useState } from 'react';

export default function AllFriends() {
  const userQuery = useUser();
  const incomingRequestsQuery = useFriendRequests('incoming', {
    fetchPolicy: 'no-cache',
  });
  const outgoingRequestsQuery = useFriendRequests('outgoing', {
    fetchPolicy: 'no-cache',
  });
  const [filter, setFilter] = useState<'incoming' | 'outgoing'>('incoming');

  if (
    userQuery.error ||
    incomingRequestsQuery.error ||
    outgoingRequestsQuery.error
  ) {
    throw (
      userQuery.error ||
      incomingRequestsQuery.error ||
      outgoingRequestsQuery.error
    );
  }

  if (
    userQuery.loading ||
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

  const user = userQuery.data.me;

  const incomingRequests = incomingRequestsQuery.data.userFriendRequests.map(
    (friendRequest) => snakeToCamel(friendRequest)
  );
  const outgoingRequests = outgoingRequestsQuery.data.userFriendRequests.map(
    (friendRequest) => snakeToCamel(friendRequest)
  );

  return (
    <>
      <div className="flex justify-evenly items-center p-2 bg-bgSecondary">
        <button
          onClick={() => setFilter('incoming')}
          className={`btn-minimal bg-inherit ${
            filter === 'incoming' && 'brightness-95'
          }`}
        >
          Incoming Requests ({incomingRequests.length})
        </button>
        <button
          onClick={() => setFilter('outgoing')}
          className={`btn-minimal bg-inherit ${
            filter === 'outgoing' && 'brightness-95'
          }`}
        >
          Outgoing Requests ({outgoingRequests.length})
        </button>
      </div>
      <main className="p-2 overflow-auto">
        <FriendRequestList
          userId={user.id}
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
