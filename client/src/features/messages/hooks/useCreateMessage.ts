import { useMutation } from '@apollo/client';

import CREATE_MESSAGE from '@/graphql/mutations/createMessage';
import { GET_ME } from '@/graphql/queries/getMe';
import { GET_CHAT } from '@/graphql/queries/getChat';

export default function useCreateMessage() {
  const [messageMutation, { data, loading, error }] = useMutation(
    CREATE_MESSAGE,
    {
      update(cache, result) {
        if (!result.data) {
          return;
        }

        const meQuery = cache.readQuery({ query: GET_ME }) as any;
        const createdMessage = result.data.createMessage;

        const createdMessageCache = {
          cursor: 'temp',
          node: {
            id: Date.now().toString(),
            creator: {
              id: meQuery.me.id,
              username: meQuery.me.username,
              discriminator: meQuery.me.discriminator,
              display_name: meQuery.me.display_name,
              profile_pic_url: meQuery.me.profile_pic_url,
              is_online: meQuery.me.is_online,
            },
            created_at: new Date().toISOString(),
            edited_at: null,
            content: createdMessage.content,
            reactions: [],
          },
        };

        cache.updateQuery(
          {
            query: GET_CHAT,
            variables: { id: createdMessage.context_id },
          },
          (oldData) => {
            if (!oldData) {
              return;
            }
            return {
              chat: {
                ...oldData.chat,
                messages: {
                  ...oldData.chat.messages,
                  edges: [createdMessageCache, ...oldData.chat.messages.edges],
                },
              },
            };
          }
        );

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
            last_message_at: new Date().toISOString(),
          },
        };

        cache.updateQuery({ query: GET_ME }, (oldData) => {
          if (!oldData) {
            return;
          }
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

  function createMessage(
    contextType: 'chat' | 'channel',
    contextId: string,
    content: string
  ) {
    return messageMutation({
      variables: { message: { contextType, contextId, content } },
    });
  }

  return { createMessage, data, loading, error };
}
