import { useState } from 'react';
import {
  ApolloError,
  gql,
  MutationHookOptions,
  useMutation,
} from '@apollo/client';

const ACCEPT_FRIEND_REQUEST = gql`
  mutation AcceptFriendRequest($userId: ID!) {
    acceptFriendRequest(userId: $userId)
  }
`;

interface AcceptFriendRequestData {
  acceptFriendRequest: boolean;
}

interface AcceptFriendRequestVariables {
  userId: string;
}

const DELETE_FRIEND_REQUEST = gql`
  mutation DeleteFriendRequest($senderId: ID!, $receiverId: ID!) {
    deleteFriendRequest(senderId: $senderId, receiverId: $receiverId)
  }
`;

interface DeleteFriendRequestData {
  deleteFriendRequest: boolean;
}

interface DeleteFriendRequestVariables {
  senderId: string;
  receiverId: string;
}

export default function useEndFriendRequest(
  options?: MutationHookOptions<NoInfer<any>, NoInfer<any>, any, any>
) {
  const [mutateAccept] = useMutation<
    AcceptFriendRequestData,
    AcceptFriendRequestVariables
  >(ACCEPT_FRIEND_REQUEST, {
    ...options,
    refetchQueries: ['GetFriendRequests'],
  });

  const [mutateDelete] = useMutation<
    DeleteFriendRequestData,
    DeleteFriendRequestVariables
  >(DELETE_FRIEND_REQUEST, {
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
