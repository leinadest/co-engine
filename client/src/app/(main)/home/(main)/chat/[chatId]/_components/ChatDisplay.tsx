import List from '@/components/common/List';
import Message, { MessageProps } from '@/features/messages/components/Message';
import { RelayConnection } from '@/types/api';
import { snakeToCamel } from '@/utils/helpers';
import TimeDivider from './TimeDivider';

interface ChatDisplayProps {
  data: MessageProps[];
  fetchMoreMessages: () => void;
}

function ChatDisplay({ data, fetchMoreMessages }: ChatDisplayProps) {
  const messages = data.map((message, idx) => {
    const item = (
      <li key={message.id}>
        <Message {...message} />
      </li>
    );

    if (idx === data.length - 1) {
      return item;
    }

    const nextMsg = snakeToCamel(data[idx + 1]);
    const messageDate = new Date(message.createdAt);
    const nextMsgDate = new Date(nextMsg.createdAt);

    if (messageDate.getDate() === nextMsgDate.getDate()) {
      return item;
    }

    return (
      <>
        {item}
        <li key={idx}>
          <TimeDivider date={nextMsgDate} />
        </li>
      </>
    );
  });

  return (
    <List
      items={messages}
      startAtBottom={true}
      onEndReached={fetchMoreMessages}
      className="p-2 pb-0 *:mb-4 last:*:mb-0"
    />
  );
}

export default ChatDisplay;
