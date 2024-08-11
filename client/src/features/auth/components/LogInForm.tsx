'use client';

import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import useAuth from '../hooks/useAuth';

import InputField from '@/components/form/InputField';
import { useEffect, useState } from 'react';

interface FormValues {
  email: string;
  password: string;
}

const validationSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .matches(
      /^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/,
      'Email must be a valid email'
    ),
  password: yup
    .string()
    .required('Password is required')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must have at least eight characters, including one lowercase letter, one uppercase letter, one number, and one special character'
    ),
});

export default function LogInForm({ formValues }: { formValues?: FormValues }) {
  const [error, setError] = useState(null);
  if (error) {
    throw error;
  }

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    if (formValues) {
      form.reset(formValues);
    }
  }, [formValues, form]);

  const { logIn } = useAuth();
  const router = useRouter();

  function onSubmit({ email, password }: FormValues) {
    logIn({ email, password })
      .then(() => {
        router.push('/home');
      })
      .catch((err) => {
        (err as any).formValues = form.getValues();
        setError(err);
      });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <InputField
        label="Email"
        name="email"
        type="email"
        placeholder="Enter your email"
        form={form}
      />
      <InputField
        label="Password"
        name="password"
        type="password"
        placeholder="Enter your password"
        form={form}
      />
      <button
        disabled={form.formState.isSubmitting}
        className="btn mt-8 w-full"
        style={{ marginTop: 8 }}
      >
        Log in
      </button>
    </form>
  );
}
