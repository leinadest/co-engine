import { gql, TypedDocumentNode, useSubscription } from '@apollo/client';
import { DateTime } from 'luxon';

interface MessageCreatedSubscriptionResult {
  messageCreated: {
    id: string;
    context_type: string;
    context_id: string;
    creator: {
      id: string;
      username: string;
      profile_pic: string;
    };
    formatted_created_at: string;
    content: string;
  };
}

interface MessageCreatedSubscriptionVariables {
  contextType: string;
  contextId: string;
}

const MESSAGE_CREATED_SUBSCRIPTION: TypedDocumentNode<
  MessageCreatedSubscriptionResult,
  MessageCreatedSubscriptionVariables
> = gql`
  subscription MessageCreatedSubscription(
    $contextType: String!
    $contextId: String!
  ) {
    messageCreated(contextType: $contextType, contextId: $contextId) {
      id
      context_type
      context_id
      creator {
        id
        username
        profile_pic
      }
      formatted_created_at
      content
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

export default function useMessages(contextType: string, contextId: string) {
  const { data, loading, error } = useSubscription(
    MESSAGE_CREATED_SUBSCRIPTION,
    {
      variables: { contextType, contextId },
      skip: !contextType || !contextId,
      onData: ({ client: { cache }, data }) => {
        if (!data.data) return;

        const createdMessage = data.data.messageCreated;
        const createdMessageCache = {
          cursor: 'temp',
          node: {
            id: Date.now().toString(),
            creator: createdMessage.creator,
            formatted_created_at: DateTime.fromJSDate(
              new Date()
            ).toLocaleString(DateTime.DATETIME_MED),
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
    }
  );

  return { data, loading, error };
}
