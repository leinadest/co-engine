'use client';

import useMessage from '@/features/messages/hooks/useMessage';
import { FormEvent, useState } from 'react';

interface ChatInputProps {
  chatId: string;
}

export default function ChatInput({ chatId }: ChatInputProps) {
  const { createMessage } = useMessage();
  const [input, setInput] = useState<string>('');
  const [error, setError] = useState<Error | null>();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const message = formData.get('message') as string;
    createMessage('chat', chatId, message)
      .then(() => {
        setInput('');
        setError(null);
      })
      .catch((err) => setError(err));
  }

  return (
    <div className="flex items-center p-4">
      <form onSubmit={onSubmit} className="grow">
        {error && <p className="error my-2">{error.message}</p>}
        <input
          type="text"
          name="message"
          placeholder="Enter your message"
          className="w-full"
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
      </form>
    </div>
  );
}
