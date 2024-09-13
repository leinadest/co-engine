'use client';

import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { snakeToCamel } from '@/utils/helpers';
import TrackerLink from '@/components/TrackerLink';
import Avatar from '@/components/Avatar';
import SkeletonList from '@/components/skeletons/SkeletonList';
import SkeletonChat from '@/app/(main)/home/_components/Sidebar/SkeletonChat';
import useMe from '@/features/users/hooks/useMe';
import Client from '@/features/users/components/Client';
import SkeletonClient from '@/features/users/components/SkeletonClient';
import AddChatBtn from './AddChatBtn';
import List from '@/components/common/List';
import Chat, { ChatProps } from '@/app/(main)/home/_components/Sidebar/Chat';
import Search from '@/components/Search';
import CollapseWrapper from '@/components/wrappers/CollapseWrapper';

interface SidebarProps {
  className?: string;
  isCollapsed?: boolean;
}

export default function Sidebar({
  className,
  isCollapsed = true,
}: SidebarProps) {
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { data, error, refetch, fetchMoreChats } = useMe({
    variables: { search: debouncedSearch },
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    refetch({ search: debouncedSearch });
  }, [refetch, debouncedSearch]);

  useEffect(() => {
    if (error) throw error;
  }, [data, error]);

  const me = snakeToCamel(data);

  const chats = me?.chats.edges.map(({ node: chat }: any) => {
    const otherUsers = chat.users.filter((user: any) => user.id !== me.id);
    return { ...chat, otherUsers };
  });

  return (
    <CollapseWrapper
      direction="left"
      expandedSize="min-w-80 max-w-80"
      isCollapsed={isCollapsed}
      btnClassName="top-20"
      className={twMerge(
        'flex flex-col items-stretch h-full border-r border-r-border bg-bgPrimary dark:border-r-border-dark transition-all',
        className
      )}
    >
      <TrackerLink
        href="/home/all-friends"
        className="flex items-center gap-2 px-4 py-2 bg-bgPrimary focus-by-brightness"
      >
        <Avatar defaultSrc={'/connections.png'} alt="connections" />
        <p>Connections</p>
      </TrackerLink>

      <Search
        setDebouncedSearch={setDebouncedSearch}
        placeholder="Search chats"
        className="pr-10"
      />

      <AddChatBtn />

      {chats ? (
        <>
          <List
            item={Chat}
            data={chats as ChatProps[]}
            onEndReached={fetchMoreChats}
          />
          <Client me={me} />
        </>
      ) : (
        <>
          <SkeletonList skeleton={<SkeletonChat />} />
          <SkeletonClient />
        </>
      )}
    </CollapseWrapper>
  );
}
