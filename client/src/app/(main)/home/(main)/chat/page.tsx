'use client';

import { useRouter } from 'next/navigation';

import useDirectChat from '@/features/chats/hooks/useDirectChat';
import SkeletonChatPage from './_components/SkeletonChatPage';
import { useEffect } from 'react';

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

  useEffect(() => {
    if (error) {
      throw error;
    }
    if (!loading && directChat) {
      router.replace(`/home/chat/${directChat.id}`);
    }
  }, [error, loading, directChat, router]);

  return <SkeletonChatPage />;
}
