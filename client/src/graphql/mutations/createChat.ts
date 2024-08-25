import { gql, TypedDocumentNode } from '@apollo/client';

export interface CreateChatResult {
  createChat: {
    id: string;
  };
}

export interface CreateChatVariables {
  name?: string;
  picture?: string;
}

const CREATE_CHAT: TypedDocumentNode<
  CreateChatResult,
  CreateChatVariables
> = gql`
  mutation CreateChat($name: String, $picture: String) {
    createChat(name: $name, picture: $picture) {
      id
    }
  }
`;

export default CREATE_CHAT;
