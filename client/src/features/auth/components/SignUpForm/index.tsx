'use client';

import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import useAuth from '../../hooks/useAuth';

import InputField from '@/components/InputField';
import { useEffect, useState } from 'react';

interface FormValues {
  username: string;
  email: string;
  password: string;
  confirmedPassword: string;
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
  password: yup
    .string()
    .required('Password is required')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must have at least eight characters, including one lowercase letter, one uppercase letter, one number, and one special character'
    ),
  confirmedPassword: yup
    .string()
    .required('Password confirmation is required')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

export default function SignUpForm({
  formValues,
}: {
  formValues?: FormValues;
}) {
  const [error, setError] = useState(null);
  if (error) {
    throw error;
  }

  const form = useForm({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmedPassword: '',
    },
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    if (formValues) {
      form.reset(formValues);
    }
  }, [formValues, form]);

  const { signUp } = useAuth();
  const router = useRouter();

  function onSubmit({ username, email, password }: FormValues) {
    signUp({ username, email, password })
      .then(() => {
        router.push('/login');
      })
      .catch((err) => {
        (err as any).formValues = form.getValues();
        setError(err);
      });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <InputField
        label="Username"
        name="username"
        type="text"
        placeholder="Create a username"
        form={form}
      />
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
        placeholder="Create a password"
        form={form}
      />
      <InputField
        label="Confirm Password"
        name="confirmedPassword"
        type="password"
        placeholder="Enter your password"
        form={form}
      />
      <button
        disabled={form.formState.isSubmitting}
        className="btn mt-8 w-full"
        style={{ marginTop: 8 }}
      >
        Sign up
      </button>
    </form>
  );
}
