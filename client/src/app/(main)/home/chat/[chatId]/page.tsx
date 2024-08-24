'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';

import useChat from '@/features/chats/hooks/useChat';
import MessageList from '@/features/messages/components/MessageList';
import SkeletonMessageList from '@/features/messages/components/SkeletonMessageList';
import { snakeToCamel } from '@/utils/helpers';
import { Edge } from '@/types/api';
import { MessageProps } from '@/features/messages/components/Message';
import useMessages from '@/features/messages/hooks/useMessages';

interface ChatPageProps {
  params: { chatId: string };
}

export default function ChatPage({ params: { chatId } }: ChatPageProps) {
  const chatQuery = useChat(chatId, { fetchPolicy: 'network-only' });
  const messagesSubscription = useMessages('chat', chatId);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (chatQuery.error || messagesSubscription.error) {
      throw chatQuery.error || messagesSubscription.error;
    }
  }, [chatQuery.error, messagesSubscription.error]);

  useLayoutEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: mainRef.current.scrollHeight });
    }
  });

  if (chatQuery.loading) {
    return (
      <main className="grow p-2 border-t overflow-auto min-w-96">
        <SkeletonMessageList />
      </main>
    );
  }

  const messages = chatQuery.data?.chat.messages.edges
    .map((edge: Edge<any>) => snakeToCamel(edge.node))
    .reverse();

  return (
    <main ref={mainRef} className="grow p-2 border-t overflow-auto min-w-96">
      <MessageList messages={messages as MessageProps[]} />
    </main>
  );
}
