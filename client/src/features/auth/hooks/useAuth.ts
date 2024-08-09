import { gql, useMutation } from '@apollo/client';

import AuthStorage from '../stores/authStorage';

const SIGN_UP = gql`
  mutation SignUp($user: CreateUserInput) {
    createUser(user: $user) {
      created_at
    }
  }
`;

const LOG_IN = gql`
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
  const [signUpMutation] = useMutation(SIGN_UP);
  const [loginMutation] = useMutation(LOG_IN);

  function signUp(formData: {
    username: string;
    email: string;
    password: string;
  }) {
    return signUpMutation({
      variables: {
        user: {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        },
      },
    });
  }

  function logIn(formData: { email: string; password: string }) {
    return loginMutation({
      variables: {
        credentials: {
          email: formData.email,
          password: formData.password,
        },
      },
    }).then((res) => {
      const accessToken = res.data.authenticate.accessToken;
      AuthStorage.setAccessToken(accessToken);
    });
  }

  return { signUp, logIn };
}
