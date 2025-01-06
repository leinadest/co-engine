'use client';

import { useRouter } from 'next/navigation';
import {
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
  useContext,
} from 'react';

import Alert, { AlertState } from '@/components/common/Alert';
import Dialog from '@/components/common/Dialog';
import useChatUser from '@/features/chats/hooks/useChatUser';
import useMe from '@/features/users/hooks/useMe';
import { snakeToCamel } from '@/utils/helpers';
import { ChatContext } from '../../../_providers/ChatContextProvider';
import useLocalStorage from '@/hooks/useLocalStorage';
import { formatError } from '@/utils/api';

interface ConfirmationDialogProps {
  showDialog: boolean;
  setShowDialog: Dispatch<SetStateAction<boolean>>;
}

export default function ConfirmationDialog({
  showDialog,
  setShowDialog,
}: ConfirmationDialogProps) {
  const { removeUserFromChat, ...removeUserResult } = useChatUser();
  const meQuery = useMe();
  const [alert, setAlert] = useState<AlertState>({ visible: false });
  const { setStorage } = useLocalStorage('lastChatId');
  const router = useRouter();

  useEffect(() => {
    const error = meQuery.error || removeUserResult.error;
    if (error) {
      setAlert({
        visible: true,
        type: 'error',
        message: `Error: ${formatError(error).message}`,
      });
    }
    if (!error && removeUserResult.data) {
      setStorage({ lastChatId: '' });
      router.push('/home');
    }
  }, [
    meQuery.error,
    removeUserResult.error,
    removeUserResult.data,
    setStorage,
    router,
  ]);

  const { chatId } = useContext(ChatContext);
  const me = snakeToCamel(meQuery.data);

  function onLeave() {
    removeUserFromChat(chatId, me.username, me.discriminator);
  }

  return (
    <>
      <Dialog open={showDialog} setOpen={setShowDialog} className="w-80">
        <p>Are you sure you want to leave the chat?</p>
        <div className="flex gap-2 mt-4">
          <button onClick={onLeave} className="btn w-full">
            Leave
          </button>
          <button onClick={() => setShowDialog(false)} className="btn w-full">
            Cancel
          </button>
        </div>
      </Dialog>
      <Alert setAlert={setAlert} {...alert} />
    </>
  );
}
