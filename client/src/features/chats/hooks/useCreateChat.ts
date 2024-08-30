import { MutationHookOptions, useMutation } from '@apollo/client';

import CREATE_CHAT, {
  CreateChatResult as CreateChatResult,
  CreateChatVariables,
} from '@/graphql/mutations/createChat';
import { GET_ME } from '@/graphql/queries/getMe';

export default function useCreateChat(
  options?: MutationHookOptions<CreateChatResult, CreateChatVariables>
) {
  const [mutate, { data, loading, error }] = useMutation(CREATE_CHAT, {
    ...options,
    update(cache, { data }) {
      if (!data) return;

      cache.updateQuery({ query: GET_ME }, (prevData) => {
        if (!prevData) return prevData;

        const newChatEdge = {
          __typename: 'ChatEdge',
          cursor: 'temp',
          node: data.createChat,
        };

        return {
          me: {
            ...prevData.me,
            chats: {
              ...prevData.me.chats,
              edges: [newChatEdge, ...prevData.me.chats.edges],
            },
          },
        };
      });
    },
  });

  function createChat(username: string, discriminator: string) {
    return mutate({ variables: { username, discriminator } });
  }

  return { createChat, data: data?.createChat, loading, error };
}
