import { TypedDocumentNode, gql } from '@apollo/client';

export interface SignUpResult {
  createUser: {
    created_at: string;
  };
}

export interface SignUpVariables {
  user: {
    username: string;
    email: string;
    password: string;
  };
}

const SIGN_UP: TypedDocumentNode<SignUpResult, SignUpVariables> = gql`
  mutation SignUp($user: CreateUserInput!) {
    createUser(user: $user) {
      created_at
    }
  }
`;

export default SIGN_UP;
