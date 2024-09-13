import { gql, TypedDocumentNode } from '@apollo/client';

export interface DeleteFriendshipResult {
  deleteFriendship: boolean;
}

export interface DeleteFriendshipVariables {
  friendId: string;
}

const DELETE_FRIENDSHIP: TypedDocumentNode<
  DeleteFriendshipResult,
  DeleteFriendshipVariables
> = gql`
  mutation DeleteFriendship($friendId: ID!) {
    deleteFriendship(friendId: $friendId)
  }
`;

export default DELETE_FRIENDSHIP;
