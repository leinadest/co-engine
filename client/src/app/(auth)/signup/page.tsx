'use client';

import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

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

export default function Signup() {
  const form = useForm({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmedPassword: '',
    },
    resolver: yupResolver(validationSchema),
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  function onSubmit({ username, email, password }: FormValues) {
    console.log({ username, email, password });
  }

  return (
    <main className="flex-col-center mx-auto p-8 max-w-sm *:w-full">
      <h1 className="text-center mb-4 text-2xl">Signup</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            placeholder="Create a username"
            {...register('username')}
          />
          <p className="error">{errors.username?.message}</p>
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            {...register('email')}
          />
          <p className="error">{errors.email?.message}</p>
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Create a password"
            {...register('password')}
          />
          <p className="error">{errors.password?.message}</p>
        </div>
        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            {...register('confirmedPassword')}
          />
          <p className="error">{errors.confirmedPassword?.message}</p>
        </div>
        <button disabled={isSubmitting} className="btn w-full">
          Sign up
        </button>
      </form>
      <div className="flex items-center gap-2 my-4">
        <hr className="w-full border-textSecondary" />
        <p className="w-fit whitespace-nowrap">or continue with</p>
        <hr className="w-full border-textSecondary" />
      </div>
      <button className="btn">Discord</button>
    </main>
  );
}
