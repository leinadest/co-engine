'use client';

import Image from 'next/image';
import { redirect } from 'next/navigation';

import ChatList from '@/features/chats/components/ChatList';
import TrackerLink from '../../components/TrackerLink';
import useUser from '@/features/users/hooks/useUser';
import SkeletonChatList from '@/features/chats/components/SkeletonChatList';
import User from '@/features/users/components/User';
import SkeletonUser from '@/features/users/components/SkeletonUser';
import { snakeToCamel } from '@/utils/helpers';

export default function Sidebar() {
  const { data, loading, error } = useUser({
    fetchPolicy: 'cache-and-network',
  });

  if (error && error.message === 'Not authenticated') {
    redirect('/login');
  }
  if (error) {
    throw error;
  }

  let chats;
  if (!loading) {
    chats = data.me.chats.edges.map((edge: any) => snakeToCamel(edge.node));
  }

  return (
    <div className="flex flex-col items-stretch border-r">
      <TrackerLink
        href="/home/all-friends"
        className="flex items-center gap-2 p-2 bg-bgPrimary focus-by-brightness"
      >
        <div className="profile-circle">
          <Image src="/connections.png" alt="home" width={26} height={26} />
        </div>
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
          <ChatList chats={chats} />
          <User profilePic={data.me.profile_pic} username={data.me.username} />
        </>
      )}
    </div>
  );
}
