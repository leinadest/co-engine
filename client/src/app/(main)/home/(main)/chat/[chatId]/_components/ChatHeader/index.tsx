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

  const chat = data?.chat;

  return (
    <header className="flex items-center p-2 gap-6 border-b border-b-border dark:border-b-border-dark">
      {chat ? (
        <ChatIdentity name={chat.name} picture={chat.picture} />
      ) : (
        <SkeletonChatIdentity />
      )}
    </header>
  );
}