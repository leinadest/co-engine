import { gql, TypedDocumentNode } from '@apollo/client';

export interface DeleteFriendRequestResult {
  deleteFriendRequest: boolean;
}

export interface DeleteFriendRequestVariables {
  senderId: string;
  receiverId: string;
}

const DELETE_FRIEND_REQUEST: TypedDocumentNode<
  DeleteFriendRequestResult,
  DeleteFriendRequestVariables
> = gql`
  mutation DeleteFriendRequest($senderId: ID!, $receiverId: ID!) {
    deleteFriendRequest(senderId: $senderId, receiverId: $receiverId)
  }
`;

export default DELETE_FRIEND_REQUEST;
