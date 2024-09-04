import { useEffect, useState } from 'react';

import { formatTimeDifference, snakeToCamel } from '@/utils/helpers';
import TrackerLink from '@/components/TrackerLink';
import Avatar from '@/components/Avatar';
import useUserUpdated from '@/features/users/hooks/useUserUpdated';

export interface ChatProps {
  id: string;
  lastMessage?: string;
  lastMessageAt?: string;
  name: string;
  otherUsers: any[];
}

export default function Chat({
  id,
  lastMessage,
  lastMessageAt,
  name,
  otherUsers,
}: ChatProps) {
  const chatIsDirect = otherUsers.length === 1;

  const [directUser, setDirectUser] = useState(
    chatIsDirect ? snakeToCamel(otherUsers[0]) : null
  );

  const userUpdatedSub = useUserUpdated({
    variables: { userIds: directUser ? [directUser.id] : [] },
  });

  useEffect(() => {
    if (!userUpdatedSub.data) return;
    const newDirectUser = snakeToCamel(userUpdatedSub.data);
    setDirectUser(newDirectUser);
  }, [userUpdatedSub.data]);

  const newName =
    name ??
    otherUsers
      .slice(0, 3)
      .map((user: any) => user.username)
      .join(', ')
      .concat(otherUsers.length > 3 ? '...' : '') ??
    'Empty Chat';

  return (
    <TrackerLink
      href={`/home/chat/${id}`}
      className="grid grid-cols-[48px_minmax(0,1fr)] gap-2 px-2 py-1 bg-bgPrimary dark:bg-bgPrimary-dark focus-by-brightness"
    >
      {directUser ? (
        <Avatar
          src={directUser.profilePicUrl}
          defaultSrc={'/person.png'}
          status={directUser.isOnline ? 'online' : 'offline'}
        />
      ) : (
        <Avatar defaultSrc="/chat.png" />
      )}
      <div className="flex flex-col justify-center">
        <div className="grid grid-cols-[1fr_40px] gap-2 items-center">
          <p className="max-w-full truncate">{newName}</p>
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
