'use client';

import { useRouter } from 'next/navigation';

import useDirectChat from '@/features/chats/hooks/useDirectChat';
import SkeletonChatPage from './SkeletonChatPage';

interface ChatPageRouterProps {
  searchParams: {
    userId: string;
  };
}

export default function ChatPageRouter({
  searchParams: { userId },
}: ChatPageRouterProps) {
  const { directChat, loading, error } = useDirectChat(userId);
  const router = useRouter();

  if (error) {
    throw error;
  }

  if (loading || !directChat) {
    return <SkeletonChatPage />;
  }

  router.replace(`/home/chat/${directChat.id}`);
}
