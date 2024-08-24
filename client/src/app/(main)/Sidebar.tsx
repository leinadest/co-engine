'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import ChatList from '@/features/chats/components/ChatList';
import TrackerLink from '../../components/TrackerLink';
import useMe from '@/features/users/hooks/useMe';
import SkeletonChatList from '@/features/chats/components/SkeletonChatList';
import User from '@/features/users/components/User';
import SkeletonUser from '@/features/users/components/SkeletonUser';
import { snakeToCamel } from '@/utils/helpers';
import { ChatProps } from '@/features/chats/components/Chat';
import ProfilePic from '@/components/users/ProfilePic';

export default function Sidebar() {
  const { data, loading, error } = useMe();
  const router = useRouter();

  useEffect(() => {
    if (error && error.message === 'Not authenticated') {
      router.replace('/login');
      return;
    }
    if (error) {
      throw error;
    }
  }, [error, router]);

  const me = snakeToCamel(data);
  const chats = data?.chats.edges.map(({ node }) => snakeToCamel(node));

  return (
    <div className="flex flex-col items-stretch border-r">
      <TrackerLink
        href="/home/all-friends"
        className="flex items-center gap-2 p-2 bg-bgPrimary focus-by-brightness"
      >
        <ProfilePic defaultSrc={'/connections.png'} alt="connections" />
        <p>Connections</p>
      </TrackerLink>
      <input
        type="text"
        placeholder="Search"
        className="m-2 px-2 rounded-md bg-bgSecondary"
      />
      {loading ? (
        <>
          <SkeletonChatList />
          <SkeletonUser />
        </>
      ) : (
        <>
          <ChatList chats={chats as ChatProps[]} />
          <User profilePicUrl={me.profilePicUrl} username={me.username} />
        </>
      )}
    </div>
  );
}
