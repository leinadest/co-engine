import { gql, TypedDocumentNode } from '@apollo/client';

interface CreateMessageData {
  createMessage: {
    id: string;
    context_type: string;
    context_id: string;
    created_at: string;
    content: string;
  };
}

interface CreateMessageVariables {
  message: {
    contextType: String;
    contextId: String;
    content: String;
  };
}

const CREATE_MESSAGE: TypedDocumentNode<
  CreateMessageData,
  CreateMessageVariables
> = gql`
  mutation CreateMessage($message: CreateMessageInput!) {
    createMessage(message: $message) {
      id
      context_type
      context_id
      created_at
      content
    }
  }
`;

export default CREATE_MESSAGE;
