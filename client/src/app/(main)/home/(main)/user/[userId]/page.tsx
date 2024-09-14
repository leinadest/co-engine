'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import TrackerLink from '@/components/TrackerLink';
import useMe from '@/features/users/hooks/useMe';
import useUser from '@/features/users/hooks/useUser';
import { snakeToCamel } from '@/utils/helpers';
import useSendFriendRequest from '@/features/friendRequests/hooks/useSendFriendRequest';
import Alert, { AlertState } from '@/components/common/Alert';
import useBlockUser from '@/features/blocked/hooks/useBlockUser';
import UserProfile from '@/features/users/components/UserProfile';
import SkeletonUserProfile from '@/features/users/components/SkeletonUserProfile';

interface UserPageProps {
  params: { userId: string };
}

export default function UserPage({ params: { userId } }: UserPageProps) {
  const [alert, setAlert] = useState<AlertState>({ visible: false });

  const meQuery = useMe();
  const userQuery = useUser(userId, { fetchPolicy: 'network-only' });

  useEffect(() => {
    if (meQuery.error || userQuery.error) {
      throw meQuery.error || userQuery.error;
    }
  }, [meQuery.error, userQuery.error]);

  const { sendFriendRequestById, ...requestResult } = useSendFriendRequest();

  useEffect(() => {
    if (requestResult.error) {
      setAlert({
        visible: true,
        type: 'error',
        message: requestResult.error.message,
      });
    }
    if (!requestResult.error && requestResult.data) {
      setAlert({
        visible: true,
        type: 'success',
        message: 'Friend request successfully sent',
      });
    }
  }, [requestResult.error, requestResult.data]);

  const { blockUser, ...blockResult } = useBlockUser();

  useEffect(() => {
    if (blockResult.error) {
      setAlert({
        visible: true,
        type: 'error',
        message: blockResult.error.message,
      });
    }
    if (!blockResult.error && blockResult.data) {
      setAlert({
        visible: true,
        type: 'success',
        message: 'User successfully blocked',
      });
    }
  }, [blockResult.error, blockResult.data]);

  const user = snakeToCamel(userQuery.data?.user);
  const me = snakeToCamel(meQuery.data);

  if (!user || !me) {
    return (
      <main className="flex-1 flex flex-col relative p-4 pt-[60px] shade-top">
        <SkeletonUserProfile />
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col relative p-4 pt-[60px] shade-top before:inset-x-4 before:rounded-b-2xl">
      {me.id !== userId && (
        <div className="flex gap-4 absolute top-4 self-center">
          <TrackerLink href={`/home/chat?userId=${userId}`}>
            <Image
              src="/chat_bubble.png"
              alt="chat bubble"
              width={26}
              height={26}
            />
          </TrackerLink>
          <button onClick={() => sendFriendRequestById(userId)}>
            <Image
              src="/friend_add.png"
              alt="friend add"
              width={26}
              height={26}
            />
          </button>
          <button onClick={() => blockUser(userId)}>
            <Image src="/block.png" alt="block" width={26} height={26} />
          </button>
        </div>
      )}
      <UserProfile
        {...user}
        isOnline={user.id === me.id ? true : user.isOnline}
      />
      <Alert {...alert} setAlert={setAlert} />
    </main>
  );
}
