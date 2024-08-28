import React from 'react';

import ChatHeader from './_components/ChatHeader';
import ChatInput from './_components/ChatInput';

interface LayoutProps {
  children: React.ReactNode;
  params: {
    chatId: string;
  };
}

export default function ChatPageLayout({
  children,
  params: { chatId },
}: LayoutProps) {
  return (
    <div className="grow flex flex-col h-full">
      <ChatHeader chatId={chatId} />
      {children}
      <ChatInput chatId={chatId} />
    </div>
  );
}
