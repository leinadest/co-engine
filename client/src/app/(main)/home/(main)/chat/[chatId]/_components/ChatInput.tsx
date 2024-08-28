'use client';

import { FormEvent, useState } from 'react';

import useCreateMessage from '@/features/messages/hooks/useCreateMessage';

interface ChatInputProps {
  chatId: string;
}

export default function ChatInput({ chatId }: ChatInputProps) {
  const { createMessage } = useCreateMessage();
  const [input, setInput] = useState<string>('');
  const [error, setError] = useState<Error | null>();

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
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
          className="w-full bg-bgSecondary"
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
      </form>
    </div>
  );
}
