import React from 'react';

import ChatHeader from './_components/ChatHeader';
import ChatInput from './_components/ChatInput';
import ChatContextProvider from './_providers/ChatContextProvider';

interface LayoutProps {
  children: React.ReactNode;
}

export default function ChatPageLayout({ children }: LayoutProps) {
  return (
    <ChatContextProvider>
      <div className="grow flex flex-col size-full bg-bgPrimary">
        <ChatHeader />
        {children}
        <ChatInput />
      </div>
    </ChatContextProvider>
  );
}
