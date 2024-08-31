'use client';

import { useContext, useEffect } from 'react';

import useChat from '@/features/chats/hooks/useChat';
import { MessageProps } from '@/features/messages/components/Message';
import useMessages from '@/features/messages/hooks/useMessages';
import useLocalStorage from '@/hooks/useLocalStorage';
import ChatDisplay from './_components/ChatDisplay';
import { RelayConnection } from '@/types/api';
import ChatContextProvider, {
  ChatContext,
} from './_providers/ChatContextProvider';

interface ChatPageProps {
  params: {
    chatId: string;
  };
}

export default function ChatPage({ params: { chatId } }: ChatPageProps) {
  const { setChatId } = useContext(ChatContext);

  useEffect(() => setChatId(chatId), [setChatId, chatId]);

  const { setStorage } = useLocalStorage('lastChatId');
  useEffect(() => setStorage({ lastChatId: chatId }), [setStorage, chatId]);

  const chatQuery = useChat({
    variables: { id: chatId },
    fetchPolicy: 'cache-and-network',
  });
  const messagesSubscription = useMessages('chat', chatId);

  useEffect(() => {
    const error = chatQuery.error || messagesSubscription.error;
    if (error) throw error;
  }, [chatQuery.data, chatQuery.error, messagesSubscription.error]);

  const messages = chatQuery.data?.messages as
    | RelayConnection<MessageProps>
    | undefined;

  return (
    <main className="grow min-h-0">
      <ChatDisplay
        data={messages}
        fetchMoreMessages={chatQuery.fetchMoreMessages}
      />
    </main>
  );
}
