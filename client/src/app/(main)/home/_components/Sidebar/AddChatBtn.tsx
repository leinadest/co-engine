import { useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';

import Dialog from '@/components/common/Dialog';
import useCreateChat from '@/features/chats/hooks/useCreateChat';
import Alert, { AlertState } from '@/components/common/Alert';
import { ApolloError } from '@apollo/client';
import useMe from '@/features/users/hooks/useMe';

const validationSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters long'),
});

export default function AddChatBtn() {
  const form = useForm({
    defaultValues: { name: '' },
    resolver: yupResolver(validationSchema),
  });
  const { errors } = form.formState;

  const meQuery = useMe();
  const { createChat, ...createChatResult } = useCreateChat();

  function onSubmit({ name }: { name?: string }) {
    if (!name || !meQuery.data) return;
    const me = meQuery.data;
    const [username, discriminator] = name.split('#');
    if (
      me.username === username &&
      me.discriminator === (discriminator ?? '0')
    ) {
      form.setError('name', {
        message: 'User cannot start a chat with themselves',
      });
      return;
    }
    createChat(username, discriminator ?? '0');
  }

  const [alert, setAlert] = useState<AlertState>({ visible: false });
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (createChatResult.error) {
      const message =
        createChatResult.error instanceof ApolloError &&
        createChatResult.error.message;
      setAlert({
        visible: true,
        type: 'error',
        message: `Error: ${message || 'Something went wrong'}`,
      });
    }
    if (!createChatResult.error && createChatResult.data) {
      router.push(`/home/chat/${createChatResult.data.id}`);
      setShowDialog(false);
    }
  }, [createChatResult.error, createChatResult.data, router]);

  const disabled = !form.formState.isDirty || form.formState.isSubmitting;

  return (
    <>
      <div className="flex justify-between items-center p-2 text-bold">
        <p>Direct Chats</p>
        <button
          onClick={() => setShowDialog(!showDialog)}
          className="relative size-6 rounded-md bg-bgPrimary focus-by-brightness"
        >
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            +
          </span>
        </button>
      </div>
      <Dialog open={showDialog} setOpen={setShowDialog} className="w-80">
        <h5>Create Chat</h5>
        <p>Select a user to start a chat with.</p>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <input
            type="text"
            placeholder="Enter username#discriminator"
            className="my-2 w-full bg-bgPrimary"
            {...form.register('name')}
          />
          {errors.name && <p className="error mb-4">{errors.name.message}</p>}
          <button
            disabled={disabled}
            className={`${disabled ? 'btn-disabled' : 'btn'} block ml-auto`}
          >
            Create
          </button>
        </form>
      </Dialog>
      <Alert setAlert={setAlert} {...alert} />
    </>
  );
}
