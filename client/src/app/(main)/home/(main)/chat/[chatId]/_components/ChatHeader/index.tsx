'use client';

import { useEffect } from 'react';
import useChat from '../../../../../../../../features/chats/hooks/useChat';
import ChatIdentity from './ChatIdentity';
import SkeletonChatIdentity from './SkeletonChatIdentity';

interface ChatHeaderProps {
  chatId: string;
}

export default function ChatHeader({ chatId }: ChatHeaderProps) {
  const { data, error } = useChat({ variables: { id: chatId } });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  return (
    <header className="flex items-center p-2 px-4 gap-6 border-b border-b-border dark:border-b-border-dark">
      {data ? (
        <ChatIdentity name={data.name} picture={data.picture} />
      ) : (
        <SkeletonChatIdentity />
      )}
    </header>
  );
}
