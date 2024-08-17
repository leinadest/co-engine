'use client';

import useMe from '@/features/users/hooks/useUser';
import useChat from '../../../../../../features/chats/hooks/useChat';
import ChatIdentity from './ChatIdentity';
import SkeletonChatIdentity from './SkeletonChatIdentity';

interface ChatHeaderProps {
  chatId: string;
}

export default function ChatHeader({ chatId }: ChatHeaderProps) {
  const userQuery = useMe();
  const chatQuery = useChat(chatId) as any;

  const user = !userQuery.loading && userQuery.data.me;
  const chat = !chatQuery.loading && chatQuery.data.chat;

  return (
    <header className="flex items-center p-2 gap-6 overflow-clip">
      {userQuery.loading || chatQuery.loading ? (
        <SkeletonChatIdentity />
      ) : (
        <ChatIdentity name={chat.name} picture={chat.picture} />
      )}
    </header>
  );
}
