'use client';

import { useEffect, useState } from 'react';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';

import InputField from '@/components/form/InputField';
import useEditMe from '@/features/users/hooks/useEditMe';
import Alert, { AlertState } from '@/components/common/Alert';

interface FormValues {
  username: string;
  email: string;
  profilePic?: string;
}

const validationSchema = yup.object().shape({
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be between 3 and 30 characters long')
    .max(30, 'Username must be between 3 and 30 characters long')
    .matches(/^[a-zA-Z0-9]+$/, 'Username must contain only letters or numbers')
    .lowercase(),
  email: yup
    .string()
    .required('Email is required')
    .matches(
      /^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/,
      'Email must be a valid email'
    ),
  profilePic: yup.string(),
});

export default function AccountForm({
  username,
  email,
  profilePic,
}: FormValues) {
  const form = useForm({
    defaultValues: { username, email, profilePic },
    resolver: yupResolver(validationSchema),
  });

  const { editMe, data, error } = useEditMe();

  function onSubmit({ username, email, profilePic }: FormValues) {
    editMe({ username, email, profilePic });
  }

  const [alert, setAlert] = useState<AlertState>({ visible: false });

  useEffect(() => {
    let name;
    if (error) {
      name = error.message.includes('username')
        ? 'username'
        : error.message.includes('email')
        ? 'email'
        : error.message.includes('profilePic') && 'profilePic';
    }

    if (name === false) {
      throw error;
    }

    if (error) {
      form.setError(name as keyof FormValues, {
        type: 'custom',
        message: error.message,
      });
    }

    if (!error && data) {
      setAlert({
        visible: true,
        type: 'success',
        message: 'Account successfully updated',
      });
      form.reset(form.getValues());
    }
  }, [data, error, form]);

  return (
    <form className="flex flex-col grow">
      <InputField
        label="Username"
        name="username"
        type="text"
        placeholder="Create a username"
        className="bold secondary"
        form={form}
      />
      <InputField
        label="Email"
        name="email"
        type="email"
        placeholder="Enter your email"
        className="bold secondary"
        form={form}
      />
      <div className="flex gap-4 mt-auto mx-auto">
        <button
          disabled={!form.formState.isDirty || form.formState.isSubmitting}
          onClick={() => form.reset()}
          className={form.formState.isDirty ? 'btn' : 'btn-disabled'}
        >
          Reset
        </button>
        <button
          disabled={!form.formState.isDirty || form.formState.isSubmitting}
          onClick={form.handleSubmit(onSubmit)}
          className={form.formState.isDirty ? 'btn' : 'btn-disabled'}
        >
          Save Changes
        </button>
      </div>
      <Alert setAlert={setAlert} {...alert} />
    </form>
  );
}
