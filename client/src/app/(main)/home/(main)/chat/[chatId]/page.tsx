'use client';

import { useContext, useEffect } from 'react';

import useChat from '@/features/chats/hooks/useChat';
import { MessageProps } from '@/features/messages/components/Message';
import useMessages from '@/features/messages/hooks/useMessages';
import useLocalStorage from '@/hooks/useLocalStorage';
import ChatDisplay from './_components/ChatDisplay';
import { RelayConnection } from '@/types/api';
import { ChatContext } from './_providers/ChatContextProvider';
import ChatHeader from './_components/ChatHeader';
import ChatInput from './_components/ChatInput';
import ChatUsersDisplay from './_components/ChatUsersDisplay';
import SkeletonList from '@/components/skeletons/SkeletonList';
import SkeletonMessage from '@/features/messages/components/SkeletonMessage';
import { twMerge } from 'tailwind-merge';

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

  const chatQuery = useChat({
    variables: { id: chatId },
    fetchPolicy: 'cache-and-network',
  });
  const messagesSubscription = useMessages('chat', chatId);

  useEffect(() => {
    const error = chatQuery.error || messagesSubscription.error;
    if (error) throw error;
  }, [chatQuery.data, chatQuery.error, messagesSubscription.error]);

  const messages = chatQuery.data?.messages as
    | RelayConnection<MessageProps>
    | undefined;

  return (
    <div
      className={twMerge(
        'grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_280px] grid-rows-[100%] size-full',
        className
      )}
    >
      <div className="flex flex-col bg-bgPrimary">
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
