'use client';

import useChat from '../../../../../../features/chats/hooks/useChat';
import ChatIdentity from './ChatIdentity';
import SkeletonChatIdentity from './SkeletonChatIdentity';

interface ChatHeaderProps {
  chatId: string;
}

export default function ChatHeader({ chatId }: ChatHeaderProps) {
  const { data, loading, error } = useChat(chatId);

  if (error) {
    throw error;
  }

  if (loading || !data) {
    return (
      <header className="flex items-center p-2 gap-6 overflow-clip">
        <SkeletonChatIdentity />
      </header>
    );
  }

  const chat = data.chat;

  return (
    <header className="flex items-center p-2 gap-6 overflow-clip">
      <ChatIdentity name={chat.name} picture={chat.picture} />
    </header>
  );
}
