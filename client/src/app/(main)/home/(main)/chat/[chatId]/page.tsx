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
import SkeletonList from '@/components/skeletons/SkeletonList';
import SkeletonMessage from '@/features/messages/components/SkeletonMessage';
import { snakeToCamel } from '@/utils/helpers';
import useUserBlocks from '@/features/blocked/hooks/useUserBlocks';
import ChatUsersDisplay from './_components/ChatUsersDisplay';

interface Props {
  params: {
    chatId: string;
    className?: string;
  };
}

export default function ChatPage({ params: { chatId, className } }: Props) {
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
    <div className={twMerge('flex-1 flex min-w-0 overflow-clip', className)}>
      <div className="grow relative flex flex-col min-w-0 bg-bgPrimary">
        <ChatHeader />
        {messages ? (
          <ChatDisplay
            data={messages}
            fetchMoreMessages={chatQuery.fetchMoreMessages}
          />
        ) : (
          <SkeletonList skeleton={<SkeletonMessage />} />
        )}
        <ChatInput />
      </div>
      <ChatUsersDisplay />
    </div>
  );
}
