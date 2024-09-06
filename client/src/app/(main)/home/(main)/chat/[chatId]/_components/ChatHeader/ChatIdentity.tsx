'use client';

import { useEffect, useState } from 'react';

import Avatar from '@/components/Avatar';
import useUserUpdated from '@/features/users/hooks/useUserUpdated';
import { snakeToCamel } from '@/utils/helpers';

interface ChatIdentityProps {
  otherUser?: any;
  name: string;
}

export default function ChatIdentity({ otherUser, name }: ChatIdentityProps) {
  const [directUser, setDirectUser] = useState(otherUser);
  const userUpdatedSub = useUserUpdated({
    variables: { userIds: directUser ? [directUser.id] : [] },
  });

  useEffect(() => {
    if (!userUpdatedSub.data) return;
    const newDirectUser = snakeToCamel(userUpdatedSub.data);
    setDirectUser(newDirectUser);
  }, [userUpdatedSub.data]);

  return (
    <div className="flex items-center gap-2">
      {directUser ? (
        <Avatar
          src={directUser?.profilePicUrl}
          defaultSrc={'/person.png'}
          alt="chat"
          status={directUser.isOnline ? 'online' : 'offline'}
        />
      ) : (
        <Avatar defaultSrc="/chat.png" alt="chat" />
      )}
      <h5 className="truncate">{name}</h5>
    </div>
  );
}
