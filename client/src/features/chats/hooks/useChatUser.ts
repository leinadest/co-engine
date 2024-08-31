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
import { GET_ME } from '@/graphql/queries/getMe';

export default function useChatUser() {
  const [mutateAdd] = useMutation(ADD_USER_TO_CHAT);
  const [mutateRemove] = useMutation(REMOVE_USER_FROM_CHAT, {
    update(cache, { data }) {
      if (!data) return;

      cache.updateQuery({ query: GET_ME }, (prevData) => {
        if (!prevData) return prevData;
        const newChatEdges = prevData.me.chats.edges.filter(
          ({ node: chat }) => chat.id !== data.removeUserFromChat.chat_id
        );
        return {
          me: {
            ...prevData.me,
            chats: { ...prevData.me.chats, edges: newChatEdges },
          },
        };
      });
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
