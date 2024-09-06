import List from '@/components/common/List';
import Message, { MessageProps } from '@/features/messages/components/Message';
import { RelayConnection } from '@/types/api';
import { snakeToCamel } from '@/utils/helpers';
import TimeDivider from './TimeDivider';
import SkeletonList from '@/components/skeletons/SkeletonList';
import SkeletonMessage from '@/features/messages/components/SkeletonMessage';

interface ChatDisplayProps {
  data: RelayConnection<MessageProps>;
  fetchMoreMessages: () => void;
}

function ChatDisplay({ data, fetchMoreMessages }: ChatDisplayProps) {
  const edges = data.edges.toReversed();

  const messages = edges.map(({ node }, idx) => {
    const msg = snakeToCamel(node);

    const item = (
      <li key={msg.id}>
        <Message {...msg} />
      </li>
    );

    if (idx === edges.length - 1) {
      return item;
    }

    const nextMsg = snakeToCamel(edges[idx + 1].node);
    const msgDate = new Date(msg.createdAt);
    const nextMsgDate = new Date(nextMsg.createdAt);

    if (msgDate.getDate() === nextMsgDate.getDate()) {
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
