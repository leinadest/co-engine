import { gql, TypedDocumentNode } from '@apollo/client';

export interface SendFriendRequestResult {
  sendFriendRequest: {
    created_at: string;
  };
}

export interface SendFriendRequestVariables {
  userId: string;
}

const SEND_FRIEND_REQUEST: TypedDocumentNode<
  SendFriendRequestResult,
  SendFriendRequestVariables
> = gql`
  mutation SendFriendRequest($userId: ID!) {
    sendFriendRequest(userId: $userId) {
      created_at
    }
  }
`;

export default SEND_FRIEND_REQUEST;
