import { TypedDocumentNode, gql } from '@apollo/client';

export interface UnblockUserVariables {
  userId: string;
}

export interface UnblockUserResult {
  unblockUser: {
    blocked_user: {
      id: string;
    };
  };
}

const UNBLOCK_USER: TypedDocumentNode<
  UnblockUserResult,
  UnblockUserVariables
> = gql`
  mutation UnblockUser($userId: ID!) {
    unblockUser(userId: $userId) {
      blocked_user {
        id
      }
    }
  }
`;

export default UNBLOCK_USER;
