'use client';

import { useContext, useEffect } from 'react';
import useChat from '../../../../../../../../features/chats/hooks/useChat';
import ChatIdentity from './ChatIdentity';
import SkeletonChatIdentity from './SkeletonChatIdentity';
import { snakeToCamel } from '@/utils/helpers';
import useMe from '@/features/users/hooks/useMe';
import Link from 'next/link';
import AddUserBtn from './AddUserBtn';
import LeaveBtn from './LeaveBtn';
import { ChatContext } from '../../_providers/ChatContextProvider';
import RemoveUserBtn from './RemoveUserBtn';

export default function ChatHeader() {
  const meQuery = useMe();
  const { chatId } = useContext(ChatContext);
  const chatQuery = useChat({ variables: { id: chatId } });

  useEffect(() => {
    const error = meQuery.error || chatQuery.error;
    if (error) throw error;
  }, [meQuery.error, chatQuery.error]);

  if (!meQuery.data || !chatQuery.data) {
    return (
      <header className="flex items-center p-2 px-4 gap-6 border-b border-b-border dark:border-b-border-dark">
        <SkeletonChatIdentity />
      </header>
    );
  }

  const chat = snakeToCamel(chatQuery.data);
  const me = snakeToCamel(meQuery.data);
  const otherUsers = chat.users.filter((user: any) => user.id !== me.id);

  const name =
    chat.name ??
    otherUsers
      .slice(0, 3)
      .map((user: any) => user.username)
      .join(', ')
      .concat(otherUsers.length > 3 ? '...' : '') ??
    'Empty Chat';
  const src = otherUsers[0]?.profilePicUrl;
  const defaultSrc = otherUsers.length === 1 ? '/person.png' : undefined;

  return (
    <header className="flex wrap-none items-center p-2 px-4 gap-2 border-b border-b-border dark:border-b-border-dark first:*:mr-auto">
      {otherUsers.length === 1 ? (
        <Link href={`/home/user/${otherUsers[0].id}`}>
          <ChatIdentity name={name} src={src} defaultSrc={defaultSrc} />
        </Link>
      ) : (
        <ChatIdentity name={name} />
      )}
      {chat.creatorId === me.id && (
        <>
          <AddUserBtn />
          <RemoveUserBtn />
        </>
      )}
      <LeaveBtn />
    </header>
  );
}
