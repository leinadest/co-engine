import { useState } from 'react';
import {
  ApolloError,
  gql,
  TypedDocumentNode,
  useMutation,
} from '@apollo/client';

import AuthStorage from '../stores/authStorage';

interface SignUpResult {
  createUser: {
    created_at: Date;
  };
}

interface SignUpVariables {
  user: {
    username: string;
    email: string;
    password: string;
  };
}

const SIGN_UP: TypedDocumentNode<SignUpResult, SignUpVariables> = gql`
  mutation SignUp($user: CreateUserInput) {
    createUser(user: $user) {
      created_at
    }
  }
`;

interface LogInResult {
  authenticate: {
    accessToken: string;
    expiresAt: string;
    user: {
      id: string;
      email: string;
      username: string;
      discriminator: string;
      created_at: string;
      profile_pic: string;
      bio: string;
    };
  };
}

interface LogInVariables {
  credentials: {
    email: string;
    password: string;
  };
}

const LOG_IN: TypedDocumentNode<LogInResult, LogInVariables> = gql`
  mutation LogIn($credentials: AuthenticateInput) {
    authenticate(credentials: $credentials) {
      accessToken
      expiresAt
      user {
        id
        email
        username
        discriminator
        created_at
        profile_pic
        bio
      }
    }
  }
`;

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
