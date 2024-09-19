'use client';

import List from '@/components/common/List';
import Search from '@/components/Search';
import Skeleton from '@/components/skeletons/Skeleton';
import SkeletonList from '@/components/skeletons/SkeletonList';
import FriendRequest from '@/features/friendRequests/components/FriendRequest';
import SkeletonFriendRequest from '@/features/friendRequests/components/SkeletonFriendRequest';
import useFriendRequests from '@/features/friendRequests/hooks/useFriendRequests';
import useMe from '@/features/users/hooks/useMe';
import { snakeToCamel } from '@/utils/helpers';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

export default function FriendRequests() {
  const [debouncedSearch, setDebouncedSearch] = useState<string>();

  const { refetch: refetchIncoming, ...incomingRequestsQuery } =
    useFriendRequests({
      variables: { type: 'received', search: debouncedSearch },
      fetchPolicy: 'cache-and-network',
    });
  const { refetch: refetchOutgoing, ...outgoingRequestsQuery } =
    useFriendRequests({
      variables: { type: 'sent', search: debouncedSearch },
      fetchPolicy: 'cache-and-network',
    });
  const meQuery = useMe();

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

  const [filter, setFilter] = useState<'received' | 'sent'>('received');

  useEffect(() => {
    if (filter === 'received') {
      refetchIncoming({ search: debouncedSearch });
    }
    if (filter === 'sent') {
      refetchOutgoing({ search: debouncedSearch });
    }
  }, [debouncedSearch, filter, refetchIncoming, refetchOutgoing]);

  if (
    !meQuery.data ||
    !incomingRequestsQuery.data ||
    !outgoingRequestsQuery.data
  ) {
    return (
      <>
        <div className="bg-bgSecondary">
          <Search
            setDebouncedSearch={setDebouncedSearch}
            placeholder="Search friend requests"
            className="bg-bgSecondary first:*:bg-bgPrimary dark:first:*:bg-bgPrimary-dark"
          />
        </div>
        <main className="overflow-auto min-h-0">
          <SkeletonList
            top={
              <div className="flex justify-evenly items-center m-4 mt-0 py-4 border-b">
                <Skeleton type="h5" className="w-56" />
                <Skeleton type="h5" className="w-56" />
              </div>
            }
            skeleton={<SkeletonFriendRequest />}
            className="mx-auto p-2 max-w-screen-lg"
          />
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
      <div className="bg-bgSecondary">
        <Search
          setDebouncedSearch={setDebouncedSearch}
          placeholder="Search friend requests"
          className="bg-bgSecondary first:*:bg-bgPrimary dark:first:*:bg-bgPrimary-dark"
        />
      </div>
      <main className="min-h-0">
        <List
          top={
            <div className="flex justify-evenly items-center m-4 mt-0 py-2 border-b">
              <button
                onClick={() => setFilter('received')}
                className={twMerge(
                  'btn-minimal bg-bgPrimary',
                  filter === 'received' && 'brightness-95 dark:brightness-150'
                )}
              >
                Incoming Requests ({totalCountIncoming})
              </button>
              <button
                onClick={() => setFilter('sent')}
                className={twMerge(
                  'btn-minimal bg-bgPrimary',
                  filter === 'sent' && 'brightness-95 dark:brightness-150'
                )}
              >
                Outgoing Requests ({totalCountOutgoing})
              </button>
            </div>
          }
          item={FriendRequest}
          data={friendRequests as any[]}
          keyHandler={({ sender, receiver }) => `${sender.id}${receiver.id}`}
          onEndReached={filteredQuery.fetchMore}
          className="mx-auto max-w-screen-lg h-full"
        />
      </main>
    </>
  );
}
