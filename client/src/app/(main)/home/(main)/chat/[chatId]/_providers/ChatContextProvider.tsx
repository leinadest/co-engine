'use client';

import { createContext, ReactNode, useState } from 'react';

export const ChatContext = createContext({
  chatId: '',
  setChatId: (chatId: string) => {},
});

interface Props {
  children: ReactNode;
}

export default function ChatContextProvider({ children }: Props) {
  const [chatId, setChatId] = useState('');

  return (
    <ChatContext.Provider value={{ chatId, setChatId }}>
      {children}
    </ChatContext.Provider>
  );
}
