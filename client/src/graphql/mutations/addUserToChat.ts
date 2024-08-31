import { gql, TypedDocumentNode } from '@apollo/client';

export interface AddUserToChatResult {
  addUserToChat: {
    user_id: string;
  };
}

export interface AddUserToChatVariables {
  chatId: string;
  username: string;
  discriminator: string;
}

const ADD_USER_TO_CHAT: TypedDocumentNode<
  AddUserToChatResult,
  AddUserToChatVariables
> = gql`
  mutation AddUserToChat(
    $chatId: ID!
    $username: String!
    $discriminator: String!
  ) {
    addUserToChat(
      chatId: $chatId
      username: $username
      discriminator: $discriminator
    ) {
      user_id
    }
  }
`;

export default ADD_USER_TO_CHAT;
