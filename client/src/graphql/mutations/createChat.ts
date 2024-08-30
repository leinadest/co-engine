import { gql, TypedDocumentNode } from '@apollo/client';

export interface CreateChatResult {
  createChat: {
    id: string;
    name?: string;
    picture?: string;
    last_message_at?: string;
    last_message?: string;
    creator_id: string;
    users: Array<{
      id: string;
      username: string;
      discriminator: string;
      profile_pic_url: string;
    }>;
  };
}

export interface CreateChatVariables {
  username: string;
  discriminator: string;
}

const CREATE_CHAT: TypedDocumentNode<
  CreateChatResult,
  CreateChatVariables
> = gql`
  mutation CreateChat($username: String, $discriminator: String) {
    createChat(username: $username, discriminator: $discriminator) {
      id
      name
      picture
      last_message_at
      last_message
      users {
        id
        username
        discriminator
        profile_pic_url
      }
    }
  }
`;

export default CREATE_CHAT;
