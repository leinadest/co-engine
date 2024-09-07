'use client';

import { createContext, ReactNode, useState } from 'react';

export const ChatContext = createContext({
  chatId: '',
  setChatId: (chatId: string) => {},
  messageSearch: '',
  setMessageSearch: (messageSearch: string) => {},
});

interface Props {
  children: ReactNode;
}

export default function ChatContextProvider({ children }: Props) {
  const [chatId, setChatId] = useState('');
  const [messageSearch, setMessageSearch] = useState('');

  return (
    <ChatContext.Provider
      value={{ chatId, setChatId, messageSearch, setMessageSearch }}
    >
      {children}
    </ChatContext.Provider>
  );
}
