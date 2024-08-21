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

interface CreateMessageData {
  createMessage: {
    id: string;
    context_type: string;
    context_id: string;
    formatted_created_at: string;
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

const GET_CREATOR = gql`
  query GetCreator {
    me {
      id
      username
      profile_pic
    }
  }
`;

const GET_CHAT = gql`
  query GetChat($id: ID!) {
    chat(id: $id) {
      id
      name
      picture
      users {
        id
        username
        profile_pic
      }
      messages {
        edges {
          cursor
          node {
            id
            creator {
              id
              username
              profile_pic
            }
            formatted_created_at
            formatted_edited_at
            content
            reactions {
              reactor_id
              reaction
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

const GET_ME = gql`
  query GetMe {
    me {
      id
      created_at
      email
      username
      discriminator
      profile_pic
      bio
      chats {
        edges {
          cursor
          node {
            id
            name
            picture
            last_message_at
            last_message
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export default function useCreateMessage() {
  const [messageMutation] = useMutation<
    CreateMessageData,
    CreateMessageVariables
  >(CREATE_MESSAGE, {
    update(cache, result, context) {
      if (!result.data) {
        return;
      }

      const creatorQuery = cache.readQuery({ query: GET_CREATOR }) as any;
      const createdMessage = result.data.createMessage;

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

      const meQuery = cache.readQuery({ query: GET_ME }) as any;
      const chatCache = meQuery.me.chats.edges.find(
        ({ node }: any) => node.id === createdMessage.context_id
      );

      if (createdMessage.context_type !== 'chat' || !chatCache) {
        return;
      }

      const updatedChatCache = {
        ...chatCache,
        node: {
          ...chatCache.node,
          last_message: createdMessage.content,
          last_message_at: new Date(),
        },
      };

      cache.updateQuery({ query: GET_ME }, (oldData) => ({
        me: {
          ...oldData.me,
          chats: {
            ...oldData.me.chats,
            edges: [
              updatedChatCache,
              ...oldData.me.chats.edges.filter(
                (edge: any) => edge !== chatCache
              ),
            ],
          },
        },
      }));
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
