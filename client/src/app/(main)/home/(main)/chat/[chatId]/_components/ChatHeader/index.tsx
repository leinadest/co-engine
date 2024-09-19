'use client';

import { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import useChat from '@/features/chats/hooks/useChat';
import ChatIdentity from './ChatIdentity';
import SkeletonChatIdentity from './SkeletonChatIdentity';
import { snakeToCamel } from '@/utils/helpers';
import useMe from '@/features/users/hooks/useMe';
import AddUserBtn from './AddUserBtn';
import LeaveBtn from './LeaveBtn';
import { ChatContext } from '../../_providers/ChatContextProvider';
import RemoveUserBtn from './RemoveUserBtn';
import Search from '@/components/Search';

export default function ChatHeader() {
  const meQuery = useMe();

  const { chatId } = useContext(ChatContext);
  const chatQuery = useChat({
    variables: { id: chatId },
  });

  useEffect(() => {
    const error = meQuery.error || chatQuery.error;
    if (error) throw error;
  }, [meQuery.error, chatQuery.error]);

  const [debouncedSearch, setDebouncedSearch] = useState<string>();
  const { setMessageSearch } = useContext(ChatContext);

  useEffect(() => {
    setMessageSearch(debouncedSearch);
  }, [setMessageSearch, debouncedSearch]);

  if (!meQuery.data || !chatQuery.data) {
    return (
      <header className="flex justify-between items-center p-2 px-4 gap-6 border-b border-b-border dark:border-b-border-dark">
        <SkeletonChatIdentity />
        <input type="text" placeholder="Search messages" disabled />
        <div className="p-2 rounded-md">
          <Image src="/door_open.png" alt="leave chat" width={26} height={26} />
        </div>
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
      .map((user: any) => user.displayName)
      .join(', ')
      .concat(otherUsers.length > 3 ? '...' : '') ??
    'Empty Chat';

  return (
    <header className="flex wrap-none justify-between items-center px-4 min-h-16 border-b border-b-border dark:border-b-border-dark overflow-x-auto overflow-y-clip">
      {otherUsers.length === 1 ? (
        <Link href={`/home/user/${otherUsers[0].id}`}>
          <ChatIdentity name={name} otherUser={otherUsers[0]} />
        </Link>
      ) : (
        <ChatIdentity name={name} />
      )}
      <Search
        setDebouncedSearch={setDebouncedSearch}
        placeholder="Search messages"
        className="py-0 w-60 first:*:min-w-0"
      />
      <div className="flex items-center gap-2">
        {chat.creatorId === me.id && (
          <>
            <AddUserBtn />
            <RemoveUserBtn />
          </>
        )}
        <LeaveBtn />
      </div>
    </header>
  );
}
