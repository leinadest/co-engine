import React from 'react';

import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';

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
