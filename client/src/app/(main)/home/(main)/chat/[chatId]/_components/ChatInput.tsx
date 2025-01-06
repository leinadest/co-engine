'use client';

import { FormEvent, useContext, useEffect, useState } from 'react';

import useCreateMessage from '@/features/messages/hooks/useCreateMessage';
import { ChatContext } from '../_providers/ChatContextProvider';
import Alert, { AlertState } from '@/components/common/Alert';
import { formatError } from '@/utils/api';

export default function ChatInput() {
  const { createMessage, error } = useCreateMessage();
  const [alert, setAlert] = useState<AlertState>({ visible: false });

  useEffect(() => {
    if (error) {
      setAlert({
        visible: true,
        type: 'error',
        message: `Error: ${formatError(error).message}`,
      });
    }
  }, [error]);

  const { chatId } = useContext(ChatContext);
  const [input, setInput] = useState<string>('');

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const message = formData.get('message') as string;
    createMessage('chat', chatId, message).then(() => {
      setInput('');
    });
  }

  return (
    <>
      <form onSubmit={onSubmit} className="relative flex items-center p-4">
        <input
          type="text"
          name="message"
          placeholder="Enter your message"
          className="w-full bg-bgSecondary"
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
      </form>
      <Alert setAlert={setAlert} {...alert} />
    </>
  );
}
