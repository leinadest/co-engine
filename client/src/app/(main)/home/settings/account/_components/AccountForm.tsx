'use client';

import { useEffect, useState } from 'react';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';

import InputField from '@/components/form/InputField';
import useUpdateMe from '@/features/users/hooks/useUpdateMe';
import Alert, { AlertState } from '@/components/common/Alert';
import ResetSaveBtns from '@/components/form/ResetSaveBtns';

interface FormValues {
  username: string;
  email: string;
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
});

export default function AccountForm({ username, email }: FormValues) {
  const form = useForm({
    defaultValues: { username, email },
    resolver: yupResolver(validationSchema),
  });

  const { updateMe, data, error } = useUpdateMe();

  function onSubmit({ username, email }: FormValues) {
    updateMe({ username, email });
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
      setAlert({ visible: true, type: 'error', message: error?.message });
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
      <ResetSaveBtns form={form} onSubmit={onSubmit} />
      <Alert setAlert={setAlert} {...alert} />
    </form>
  );
}
