import React from 'react';

import ChatHeader from '@/features/chats/components/ChatHeader';
import ChatInput from '@/features/chats/components/ChatInput';

interface LayoutProps {
  children: React.ReactNode;
  params: {
    chatId: string;
  };
}

export default function Layout({ children, params: { chatId } }: LayoutProps) {
  return (
    <div className="flex flex-col">
      <ChatHeader chatId={chatId} />
      {children}
      <ChatInput chatId={chatId} />
    </div>
  );
}
