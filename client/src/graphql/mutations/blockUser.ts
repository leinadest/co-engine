import { TypedDocumentNode, gql } from '@apollo/client';

export interface BlockUserResult {
  blockUser: {
    blocked_user_id: string;
    created_at: string;
  };
}

export interface BlockUserVariables {
  userId: string;
}

const BLOCK_USER: TypedDocumentNode<BlockUserResult, BlockUserVariables> = gql`
  mutation BlockUser($userId: ID!) {
    blockUser(userId: $userId) {
      created_at
    }
  }
`;

export default BLOCK_USER;
