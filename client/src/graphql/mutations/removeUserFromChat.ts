import { gql, TypedDocumentNode } from '@apollo/client';

export interface RemoveUserFromChatResult {
  removeUserFromChat: {
    chat_id: string;
  };
}

export interface RemoveUserFromChatVariables {
  chatId: string;
  username: string;
  discriminator: string;
}

const REMOVE_USER_FROM_CHAT: TypedDocumentNode<
  RemoveUserFromChatResult,
  RemoveUserFromChatVariables
> = gql`
  mutation RemoveUserFromChat(
    $chatId: ID!
    $username: String!
    $discriminator: String!
  ) {
    removeUserFromChat(
      chatId: $chatId
      username: $username
      discriminator: $discriminator
    ) {
      chat_id
    }
  }
`;

export default REMOVE_USER_FROM_CHAT;
