import { gql, TypedDocumentNode } from '@apollo/client';

export interface AcceptFriendRequestResult {
  acceptFriendRequest: boolean;
}

export interface AcceptFriendRequestVariables {
  userId: string;
}

const ACCEPT_FRIEND_REQUEST: TypedDocumentNode<
  AcceptFriendRequestResult,
  AcceptFriendRequestVariables
> = gql`
  mutation AcceptFriendRequest($userId: ID!) {
    acceptFriendRequest(userId: $userId)
  }
`;

export default ACCEPT_FRIEND_REQUEST;
