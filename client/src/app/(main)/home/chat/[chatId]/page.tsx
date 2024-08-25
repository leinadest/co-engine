'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';

import useChat from '@/features/chats/hooks/useChat';
import SkeletonMessageList from '@/features/messages/components/SkeletonMessageList';
import { snakeToCamel } from '@/utils/helpers';
import Message from '@/features/messages/components/Message';
import useMessages from '@/features/messages/hooks/useMessages';
import List from '@/components/common/List';

interface ChatPageProps {
  params: { chatId: string };
}

export default function ChatPage({ params: { chatId } }: ChatPageProps) {
  const chatQuery = useChat(chatId, { fetchPolicy: 'cache-and-network' });
  const messagesSubscription = useMessages('chat', chatId);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (chatQuery.error || messagesSubscription.error) {
      throw chatQuery.error || messagesSubscription.error;
    }
  }, [chatQuery.data, chatQuery.error, messagesSubscription.error]);

  const messages =
    chatQuery.data?.chat.messages.edges
      .map(({ node }) => snakeToCamel(node))
      .reverse() ?? [];

  return (
    <main ref={mainRef} className="grow p-2 border-t min-w-96 min-h-0">
      {messages ? (
        <List
          item={Message}
          data={messages}
          startAtBottom={true}
          onEndReached={chatQuery.fetchMoreMessages}
          className="*:mb-4 last:*:mb-0"
        />
      ) : (
        <SkeletonMessageList />
      )}
    </main>
  );
}
