'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import TrackerLink from '../../components/TrackerLink';
import useMe from '@/features/users/hooks/useMe';
import User from '@/features/users/components/User';
import SkeletonUser from '@/features/users/components/SkeletonUser';
import { snakeToCamel } from '@/utils/helpers';
import Chat, { ChatProps } from '@/features/chats/components/Chat';
import Avatar from '@/components/Avatar';
import List from '@/components/common/List';
import SkeletonChat from '@/features/chats/components/SkeletonChat';
import SkeletonList from '@/components/skeletons/SkeletonList';

export default function Sidebar() {
  const { data, error, fetchMoreChats } = useMe();
  const router = useRouter();

  useEffect(() => {
    if (error && error.message === 'Not authenticated') {
      router.replace('/login');
      return;
    }
    if (error) {
      throw error;
    }
  }, [data, error, router]);

  const me = snakeToCamel(data);
  const chats = data?.chats.edges.map(({ node }) => snakeToCamel(node));

  return (
    <div className="flex flex-col items-stretch border-r border-r-border bg-bgPrimary dark:border-r-border-dark">
      <TrackerLink
        href="/home/all-friends"
        className="flex items-center gap-2 p-2 bg-bgPrimary focus-by-brightness"
      >
        <Avatar defaultSrc={'/connections.png'} alt="connections" />
        <p>Connections</p>
      </TrackerLink>
      <input
        type="text"
        placeholder="Search"
        className="m-2 px-2 rounded-md bg-bgSecondary"
      />
      <div className="flex justify-between p-2 text-bold">
        <p>Direct Chats</p>
        <button>+</button>
      </div>
      {data ? (
        <>
          <List
            item={Chat}
            data={chats as ChatProps[]}
            onEndReached={fetchMoreChats}
            className="grow basis-0 overflow-auto"
          />
          <User profilePicUrl={me.profilePicUrl} username={me.username} />
        </>
      ) : (
        <>
          <SkeletonList
            skeleton={<SkeletonChat />}
            className={'grow basis-0 overflow-auto'}
          />
          <SkeletonUser />
        </>
      )}
    </div>
  );
}
