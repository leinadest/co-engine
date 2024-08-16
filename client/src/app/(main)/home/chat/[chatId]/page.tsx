'use client';

import { useLayoutEffect, useRef } from 'react';

import useChat from '@/features/chats/hooks/useChat';
import MessageList from '@/features/messages/components/MessageList';
import SkeletonMessageList from '@/features/messages/components/SkeletonMessageList';
import { snakeToCamel } from '@/utils/helpers';
import { Edge } from '@/types/api';

interface ChatPageProps {
  params: { chatId: string };
}

export default function ChatPage({ params: { chatId } }: ChatPageProps) {
  const { data, loading, error } = useChat(chatId, {
    fetchPolicy: 'cache-and-network',
  });
  const mainRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: mainRef.current.scrollHeight });
    }
  });

  if (loading) {
    return (
      <main className="grow p-2 border-t overflow-auto min-w-96">
        <SkeletonMessageList />
      </main>
    );
  }

  const messages = data.chat.messages.edges
    .map((edge: Edge<any>) => snakeToCamel(edge.node))
    .reverse();

  return (
    <main ref={mainRef} className="grow p-2 border-t overflow-auto min-w-96">
      <MessageList messages={messages} />
    </main>
  );
}
