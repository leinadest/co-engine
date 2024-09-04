import { gql, TypedDocumentNode } from '@apollo/client';

export interface UpdateMeResult {
  updateMe: {
    email: string;
    username: string;
    discriminator: string;
    bio: string;
  };
}

export interface UpdateMeVariables {
  update: {
    username?: string;
    email?: string;
    isOnline?: boolean;
    bio?: string;
  };
}

const UPDATE_ME: TypedDocumentNode<UpdateMeResult, UpdateMeVariables> = gql`
  mutation UpdateMe($update: UpdateMeInput!) {
    updateMe(update: $update) {
      email
      username
      discriminator
      bio
    }
  }
`;

export default UPDATE_ME;
