'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { snakeToCamel } from '@/utils/helpers';
import TrackerLink from '@/components/TrackerLink';
import Avatar from '@/components/Avatar';
import SkeletonList from '@/components/skeletons/SkeletonList';
import SkeletonChat from '@/app/(main)/home/_components/Sidebar/SkeletonChat';
import useMe from '@/features/users/hooks/useMe';
import User from '@/features/users/components/User';
import SkeletonUser from '@/features/users/components/SkeletonUser';
import AddChatBtn from './AddChatBtn';
import List from '@/components/common/List';
import Chat, { ChatProps } from '@/app/(main)/home/_components/Sidebar/Chat';

export default function Sidebar({ className }: { className?: string }) {
  const { data, error, fetchMoreChats } = useMe();
  const router = useRouter();

  useEffect(() => {
    if (error) throw error;
  }, [data, error, router]);

  const me = snakeToCamel(data);

  const chats = me?.chats.edges.map(({ node: chat }: any) => {
    const otherUsers = chat.users.filter((user: any) => user.id !== me.id);
    return { ...chat, otherUsers };
  });

  return (
    <div
      className={`${className} flex flex-col items-stretch min-h-0 border-r border-r-border bg-bgPrimary dark:border-r-border-dark`}
    >
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
      <AddChatBtn />
      {data ? (
        <>
          <List
            item={Chat}
            data={chats as ChatProps[]}
            onEndReached={fetchMoreChats}
          />
          <User me={me} />
        </>
      ) : (
        <>
          <SkeletonList skeleton={<SkeletonChat />} />
          <SkeletonUser />
        </>
      )}
    </div>
  );
}
