import React from 'react';

import ChatContextProvider from './_providers/ChatContextProvider';

interface LayoutProps {
  children: React.ReactNode;
}

export default function ChatPageLayout({ children }: LayoutProps) {
  return <ChatContextProvider>{children}</ChatContextProvider>;
}
