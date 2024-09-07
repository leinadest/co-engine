'use client';

import { useContext, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

import useChat from '@/features/chats/hooks/useChat';
import useMessages from '@/features/messages/hooks/useMessages';
import useLocalStorage from '@/hooks/useLocalStorage';
import ChatDisplay from './_components/ChatDisplay';
import { ChatContext } from './_providers/ChatContextProvider';
import ChatHeader from './_components/ChatHeader';
import ChatInput from './_components/ChatInput';
import ChatUsersDisplay from './_components/ChatUsersDisplay';
import SkeletonList from '@/components/skeletons/SkeletonList';
import SkeletonMessage from '@/features/messages/components/SkeletonMessage';
import { snakeToCamel } from '@/utils/helpers';
import useUserBlocks from '@/features/blocked/hooks/useUserBlocks';

interface ChatPageProps {
  params: {
    chatId: string;
  };
  className?: string;
}

export default function ChatPage({
  params: { chatId },
  className,
}: ChatPageProps) {
  const { setChatId } = useContext(ChatContext);
  useEffect(() => setChatId(chatId), [setChatId, chatId]);

  const { setStorage } = useLocalStorage('lastChatId');
  useEffect(() => setStorage({ lastChatId: chatId }), [setStorage, chatId]);

  const { messageSearch } = useContext(ChatContext);

  const chatQuery = useChat({
    variables: { id: chatId, search: messageSearch },
    fetchPolicy: 'cache-and-network',
  });
  const messagesSubscription = useMessages('chat', chatId);
  const userBlocksQuery = useUserBlocks();

  useEffect(() => {
    const error =
      chatQuery.error || messagesSubscription.error || userBlocksQuery.error;
    if (error) throw error;
  }, [
    chatQuery.data,
    chatQuery.error,
    messagesSubscription.error,
    userBlocksQuery.error,
  ]);

  const blockedUserIds = userBlocksQuery.data?.edges.reduce<
    Record<string, any>
  >((acc, { node: userBlock }: any) => {
    acc[snakeToCamel(userBlock).blockedUser.id as string] = true;
    return acc;
  }, {});

  const messages = chatQuery.data?.messages.edges
    .map(({ node: message }) => snakeToCamel(message))
    .filter((message) => !blockedUserIds || !blockedUserIds[message.creator.id])
    .reverse() as any[] | undefined;

  return (
    <div
      className={twMerge(
        'grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_280px] grid-rows-[100%] size-full',
        className
      )}
    >
      <div className="relative flex flex-col bg-bgPrimary">
        <ChatHeader />
        {messages ? (
          <ChatDisplay
            data={messages}
            fetchMoreMessages={chatQuery.fetchMoreMessages}
          />
        ) : (
          <SkeletonList
            skeleton={<SkeletonMessage />}
            className="p-2 pb-0 *:mb-4 last:*:mb-0"
          />
        )}
        <ChatInput />
      </div>
      <ChatUsersDisplay className="hidden sm:flex" />
    </div>
  );
}
