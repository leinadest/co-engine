import Chat, { ChatProps } from './Chat';

interface ChatListProps {
  chats: ChatProps[];
}

export default function ChatList({ chats }: ChatListProps) {
  return (
    <div className="grow basis-0 min-h-0 flex flex-col ">
      <div className="flex justify-between p-2 text-bold">
        <p>Direct Chats</p>
        <button>+</button>
      </div>
      <ul className="grow basis-0 min-h-0 overflow-auto">
        {chats.map((chat) => (
          <Chat key={chat.id} {...chat} />
        ))}
      </ul>
    </div>
  );
}
