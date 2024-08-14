import { GET_CHAT } from '@/features/chats/hooks/useChat';
import { gql, useMutation } from '@apollo/client';
import { DateTime } from 'luxon';

const CREATE_MESSAGE = gql`
  mutation CreateMessage($message: CreateMessageInput!) {
    createMessage(message: $message) {
      id
      context_type
      context_id
      formatted_created_at
      content
    }
  }
`;

const GET_CREATOR = gql`
  query GetCreator {
    me {
      id
      username
      profile_pic
    }
  }
`;

export default function useMessage() {
  const [messageMutation] = useMutation(CREATE_MESSAGE, {
    update(cache, result) {
      const createdMessage = result.data.createMessage;
      const creatorQuery = cache.readQuery({ query: GET_CREATOR }) as any;

      const createdMessageCache = {
        cursor: 'temp',
        node: {
          id: Date.now().toString(),
          creator: creatorQuery.me,
          formatted_created_at: DateTime.fromJSDate(new Date()).toLocaleString(
            DateTime.DATETIME_MED
          ),
          formatted_edited_at: null,
          content: createdMessage.content,
          reactions: [],
        },
      };

      cache.updateQuery(
        {
          query: GET_CHAT,
          variables: { id: createdMessage.context_id },
        },
        (oldData) => ({
          ...oldData,
          chat: {
            ...oldData.chat,
            messages: {
              ...oldData.chat.messages,
              edges: [createdMessageCache, ...oldData.chat.messages.edges],
            },
          },
        })
      );
    },
  });

  function createMessage(
    contextType: 'chat' | 'channel',
    contextId: string,
    content: string
  ) {
    return messageMutation({
      variables: { message: { contextType, contextId, content } },
    });
  }

  return { createMessage };
}
