import { useState } from 'react';
import { ApolloError, MutationHookOptions, useMutation } from '@apollo/client';

import ACCEPT_FRIEND_REQUEST from '@/graphql/mutations/acceptFriendRequest';
import DELETE_FRIEND_REQUEST from '@/graphql/mutations/deleteFriendRequest';

export default function useEndFriendRequest(
  options?: MutationHookOptions<any, any>
) {
  const [mutateAccept] = useMutation(ACCEPT_FRIEND_REQUEST, {
    ...options,
    refetchQueries: ['GetFriendRequests'],
  });

  const [mutateDelete] = useMutation(DELETE_FRIEND_REQUEST, {
    ...options,
    refetchQueries: ['GetFriendRequests'],
  });

  const [data, setData] = useState<any>();
  const [loading, setLoading] = useState<boolean>();
  const [error, setError] = useState<ApolloError>();

  function acceptFriendRequest(userId: string) {
    setLoading(true);
    setError(undefined);
    return mutateAccept({ variables: { userId } })
      .then((res) => setData(res.data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }

  function deleteFriendRequest(senderId: string, receiverId: string) {
    setLoading(true);
    setError(undefined);
    return mutateDelete({ variables: { senderId, receiverId } })
      .then((res) => setData(res.data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }

  return { acceptFriendRequest, deleteFriendRequest, data, loading, error };
}
