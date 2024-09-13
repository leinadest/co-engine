import { ApolloError, MutationHookOptions, useMutation } from '@apollo/client';
import { useState } from 'react';

import ADD_USER_TO_CHAT, {
  AddUserToChatResult,
  AddUserToChatVariables,
} from '@/graphql/mutations/addUserToChat';
import REMOVE_USER_FROM_CHAT, {
  RemoveUserFromChatResult,
  RemoveUserFromChatVariables,
} from '@/graphql/mutations/removeUserFromChat';
import GET_USERS from '@/graphql/queries/getUsers';
import { GET_ME } from '@/graphql/queries/getMe';

export default function useChatUser() {
  const [mutateAdd] = useMutation(ADD_USER_TO_CHAT);

  const [mutateRemove] = useMutation(REMOVE_USER_FROM_CHAT, {
    update(cache, { data }) {
      if (!data) return;

      let removedSelf = false;

      cache.updateQuery({ query: GET_ME }, (prevData) => {
        if (!prevData) return prevData;
        removedSelf = data.removeUserFromChat.user_id === prevData.me.id;
        if (!removedSelf) return prevData;
        const newEdges = prevData.me.chats.edges.filter(
          ({ node: chat }) => chat.id !== data.removeUserFromChat.chat_id
        );
        return {
          me: {
            ...prevData.me,
            chats: {
              edges: newEdges,
              pageInfo: prevData.me.chats.pageInfo,
            },
          },
        };
      });

      if (removedSelf) return;

      cache.updateQuery(
        {
          query: GET_USERS,
          variables: {
            contextType: 'chat',
            contextId: data.removeUserFromChat.chat_id,
          },
        },
        (prevData) => {
          if (!prevData) return prevData;
          const newEdges = prevData.users.edges.filter(
            ({ node: user }) => user.id !== data.removeUserFromChat.user_id
          );
          return {
            users: {
              edges: newEdges,
              pageInfo: prevData.users.pageInfo,
            },
          };
        }
      );
    },
  });

  const [data, setData] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApolloError>();

  function addUserToChat(
    chatId: string,
    username: string,
    discriminator: string,
    options?: MutationHookOptions<AddUserToChatResult, AddUserToChatVariables>
  ) {
    setLoading(true);
    setError(undefined);
    return mutateAdd({
      ...options,
      variables: { chatId, username, discriminator },
      refetchQueries: [
        {
          query: GET_USERS,
          variables: { contextType: 'chat', contextId: chatId },
        },
      ],
    })
      .then((res) => setData(res.data?.addUserToChat))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }

  function removeUserFromChat(
    chatId: string,
    username: string,
    discriminator: string,
    options?: MutationHookOptions<
      RemoveUserFromChatResult,
      RemoveUserFromChatVariables
    >
  ) {
    setLoading(true);
    setError(undefined);
    return mutateRemove({
      ...options,
      variables: { chatId, username, discriminator },
    })
      .then((res) => setData(res.data?.removeUserFromChat))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }

  return { addUserToChat, removeUserFromChat, data, loading, error };
}
