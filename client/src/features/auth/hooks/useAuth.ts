import { useState } from 'react';
import { ApolloError, useMutation } from '@apollo/client';

import AuthStorage from '../stores/authStorage';
import LOG_IN from '@/graphql/mutations/logIn';
import SIGN_UP from '@/graphql/mutations/signUp';

export default function useAuth() {
  const [signUpMutate] = useMutation(SIGN_UP);
  const [loginMutate] = useMutation(LOG_IN);

  const [data, setData] = useState<any>();
  const [loading, setLoading] = useState<boolean>();
  const [error, setError] = useState<ApolloError>();

  function signUp(formData: {
    username: string;
    email: string;
    password: string;
  }) {
    return signUpMutate({
      variables: {
        user: {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        },
      },
    })
      .then((res) => setData(res.data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }

  function logIn(formData: { email: string; password: string }) {
    return loginMutate({
      variables: {
        credentials: {
          email: formData.email,
          password: formData.password,
        },
      },
    })
      .then((res) => {
        const accessToken = res.data?.authenticate.accessToken;
        AuthStorage.setAccessToken(accessToken ?? '');
        setData(res.data);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }

  return { signUp, logIn, data, loading, error };
}
