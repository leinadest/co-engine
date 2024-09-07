import { useSubscription } from '@apollo/client';

import { GET_CHAT } from '@/graphql/queries/getChat';
import { GET_ME } from '@/graphql/queries/getMe';
import MESSAGE_CREATED_SUBSCRIPTION from '@/graphql/subscriptions/messageCreated';

export default function useMessages(contextType: string, contextId: string) {
  const { data, loading, error } = useSubscription(
    MESSAGE_CREATED_SUBSCRIPTION,
    {
      variables: { contextType, contextId },
      skip: !contextType || !contextId,
      onData: ({ client: { cache }, data }) => {
        if (!data.data) return;

        const createdMessage = data.data.messageCreated;

        cache.updateQuery(
          {
            query: GET_CHAT,
            variables: { id: createdMessage.context_id },
          },
          (oldData) => {
            if (!oldData) return;

            const newEdge = {
              cursor: 'temp',
              node: {
                id: Date.now().toString(),
                creator: { ...createdMessage.creator, is_online: true },
                created_at: new Date().toISOString(),
                edited_at: null,
                content: createdMessage.content,
                reactions: [],
              },
            };

            return {
              chat: {
                ...oldData.chat,
                messages: {
                  ...oldData.chat.messages,
                  edges: [newEdge, ...oldData.chat.messages.edges],
                },
              },
            };
          }
        );

        const meQuery = cache.readQuery({ query: GET_ME });
        const chatCache = meQuery?.me.chats.edges.find(
          ({ node: chat }: any) => chat.id === createdMessage.context_id
        );

        if (createdMessage.context_type !== 'chat' || !chatCache) {
          return;
        }

        const updatedChatCache = {
          ...chatCache,
          node: {
            ...chatCache.node,
            last_message: createdMessage.content,
            last_message_at: new Date().toISOString(),
          },
        };

        cache.updateQuery({ query: GET_ME }, (oldData) => {
          if (!oldData) return;
          return {
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
          };
        });
      },
    }
  );

  return { data, loading, error };
}
