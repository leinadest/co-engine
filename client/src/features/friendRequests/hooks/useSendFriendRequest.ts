import { ApolloError, MutationHookOptions, useMutation } from '@apollo/client';
import { useState } from 'react';

import SEND_FRIEND_REQUEST, {
  SendFriendRequestResult,
  SendFriendRequestVariables,
} from '@/graphql/mutations/sendFriendRequest';
import SEND_FRIEND_REQUEST_BY_USERNAME, {
  SendFriendRequestByUsernameResult,
  SendFriendRequestByUsernameVariables,
} from '@/graphql/mutations/sendFriendRequestByUsername';

export default function useSendFriendRequest(
  options?: MutationHookOptions<any, any>
) {
  const [mutateById] = useMutation<
    SendFriendRequestResult,
    SendFriendRequestVariables
  >(SEND_FRIEND_REQUEST, options);
  const [mutateByUsername] = useMutation<
    SendFriendRequestByUsernameResult,
    SendFriendRequestByUsernameVariables
  >(SEND_FRIEND_REQUEST_BY_USERNAME, options);

  const [data, setData] = useState<any>();
  const [loading, setLoading] = useState<boolean>();
  const [error, setError] = useState<ApolloError>();

  function sendFriendRequestById(userId: string) {
    setLoading(true);
    setError(undefined);
    return mutateById({ variables: { userId } })
      .then((res) => setData(res.data?.sendFriendRequest))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }

  function sendFriendRequestByUsername(
    username: string,
    discriminator: string
  ) {
    setLoading(true);
    setError(undefined);
    return mutateByUsername({ variables: { username, discriminator } })
      .then((res) => setData(res.data?.sendFriendRequestByUsername))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }

  return {
    sendFriendRequestById,
    sendFriendRequestByUsername,
    data,
    loading,
    error,
  };
}
