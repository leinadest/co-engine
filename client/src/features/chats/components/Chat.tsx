import Image from 'next/image';

import { calculateTimeDifference } from '../../../utils/helpers';
import TrackerLink from '@/components/TrackerLink';

export interface ChatProps {
  id: string;
  lastMessage: string;
  lastMessageAt: string;
  name: string;
  picture: string;
}

export default function Chat({
  id,
  lastMessage,
  lastMessageAt,
  name,
  picture,
}: ChatProps) {
  picture = '/connections.png';
  return (
    <TrackerLink
      href={`/home/chat/${id}`}
      className="grid grid-cols-[48px_1fr] gap-2 px-2 py-1 bg-bgPrimary focus-by-brightness"
    >
      <div className="profile-circle">
        <Image src={picture} alt="profile" width={26} height={26} />
      </div>
      <div className="flex flex-col justify-center">
        <div className="grid grid-cols-[1fr_50px] gap-2 items-center">
          <p>{name}</p>
          <p className="text-right text-xs">
            {calculateTimeDifference(lastMessageAt)}
          </p>
        </div>
        <p className="text-xs max-w-52 truncate">{lastMessage}</p>
      </div>
    </TrackerLink>
  );
}
