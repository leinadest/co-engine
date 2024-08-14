import Message, { MessageProps } from './Message';

interface MessageListProps {
  messages: Array<MessageProps>;
}

export default function MessageList({ messages }: MessageListProps) {
  return (
    <ul className="flex flex-col gap-4">
      {messages.map((message) => (
        <Message key={message.id} {...message} />
      ))}
    </ul>
  );
}
