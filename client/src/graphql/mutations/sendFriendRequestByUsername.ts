import { gql, TypedDocumentNode } from '@apollo/client';

export interface SendFriendRequestByUsernameResult {
  sendFriendRequestByUsername: {
    created_at: string;
  };
}

export interface SendFriendRequestByUsernameVariables {
  username: string;
  discriminator: string;
}

const SEND_FRIEND_REQUEST_BY_USERNAME: TypedDocumentNode<
  SendFriendRequestByUsernameResult,
  SendFriendRequestByUsernameVariables
> = gql`
  mutation SendFriendRequestByUsername(
    $username: String!
    $discriminator: String!
  ) {
    sendFriendRequestByUsername(
      username: $username
      discriminator: $discriminator
    ) {
      created_at
    }
  }
`;

export default SEND_FRIEND_REQUEST_BY_USERNAME;
