import { ApolloError } from '@apollo/client';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { AlertState } from '@/components/common/Alert';
import useChatUser from '@/features/chats/hooks/useChatUser';
import { ChatContext } from '../../../_providers/ChatContextProvider';

const validationSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters long'),
});

interface AddUserFormProps {
  setAlert: React.Dispatch<React.SetStateAction<AlertState>>;
}

function AddUserForm({ setAlert }: AddUserFormProps) {
  const { addUserToChat, data, error } = useChatUser();

  const form = useForm({
    defaultValues: { name: '' },
    resolver: yupResolver(validationSchema),
  });

  const { chatId } = useContext(ChatContext);

  function onSubmit({ name }: { name?: string }) {
    if (!name) return;
    const [username, discriminator] = name.split('#');
    addUserToChat(chatId, username, discriminator ?? '0');
  }

  useEffect(() => {
    if (error) {
      const message = error instanceof ApolloError && error.message;
      setAlert({
        visible: true,
        type: 'error',
        message: `Error: ${message || 'Something went wrong'}`,
      });
    }
    if (!error && data) {
      setAlert({
        visible: true,
        type: 'success',
        message: 'User successfully added to chat',
      });
      form.reset();
    }
  }, [error, data, setAlert, form]);

  const { errors } = form.formState;
  const disabled = !form.formState.isDirty || form.formState.isSubmitting;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <h5>Add User to Chat</h5>
      <p>Select a user to add to this chat</p>
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
        Add User
      </button>
    </form>
  );
}

export default AddUserForm;
