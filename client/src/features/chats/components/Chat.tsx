import { formatTimeDifference } from '../../../utils/helpers';
import TrackerLink from '@/components/TrackerLink';
import Avatar from '@/components/Avatar';

export interface ChatProps {
  id: string;
  lastMessage?: string;
  lastMessageAt?: string;
  name: string;
  src: string;
  defaultSrc: string;
}

export default function Chat({
  id,
  lastMessage,
  lastMessageAt,
  name,
  src,
  defaultSrc,
}: ChatProps) {
  return (
    <TrackerLink
      href={`/home/chat/${id}`}
      className="grid grid-cols-[48px_minmax(0,1fr)] gap-2 px-2 py-1 bg-bgPrimary dark:bg-bgPrimary-dark focus-by-brightness"
    >
      <Avatar src={src} defaultSrc={defaultSrc || '/chat.png'} />
      <div className="flex flex-col justify-center">
        <div className="grid grid-cols-[1fr_40px] gap-2 items-center">
          <p className="max-w-full truncate">{name}</p>
          {lastMessageAt && (
            <p className="text-right text-xs">
              {formatTimeDifference(lastMessageAt)}
            </p>
          )}
        </div>
        {lastMessage && (
          <p className="text-xs max-w-full truncate">{lastMessage}</p>
        )}
      </div>
    </TrackerLink>
  );
}
