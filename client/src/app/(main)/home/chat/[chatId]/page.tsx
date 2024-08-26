'use client';

import { useEffect, useRef } from 'react';

import useChat from '@/features/chats/hooks/useChat';
import { snakeToCamel } from '@/utils/helpers';
import Message from '@/features/messages/components/Message';
import useMessages from '@/features/messages/hooks/useMessages';
import List from '@/components/common/List';
import SkeletonList from '@/components/skeletons/SkeletonList';
import SkeletonMessage from '@/features/messages/components/SkeletonMessage';

interface ChatPageProps {
  params: { chatId: string };
}

export default function ChatPage({ params: { chatId } }: ChatPageProps) {
  const chatQuery = useChat({
    variables: { id: chatId },
    fetchPolicy: 'cache-and-network',
  });
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
    <main ref={mainRef} className="grow border-t min-w-96 min-h-0">
      {chatQuery.data ? (
        <List
          item={Message}
          data={messages}
          startAtBottom={true}
          onEndReached={chatQuery.fetchMoreMessages}
          className="p-2 *:mb-4 last:*:mb-0"
        />
      ) : (
        <SkeletonList
          skeleton={<SkeletonMessage />}
          className="p-2 *:mb-4 last:*:mb-0"
        />
      )}
    </main>
  );
}
