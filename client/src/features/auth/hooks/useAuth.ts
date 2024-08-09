import { gql, useMutation } from '@apollo/client';

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
    });
  }

  return { signUp, logIn };
}
