import {
  ApolloError,
  gql,
  MutationHookOptions,
  useMutation,
} from '@apollo/client';
import { useState } from 'react';

const SEND_FRIEND_REQUEST = gql`
  mutation SendFriendRequest($userId: ID!) {
    sendFriendRequest(userId: $userId) {
      created_at
    }
  }
`;

interface SendFriendRequestData {
  sendFriendRequest: {
    created_at: string;
  };
}

interface SendFriendRequestVariables {
  userId: string;
}

const SEND_FRIEND_REQUEST_BY_USERNAME = gql`
  mutation SendFriendRequestByUsername(
    $username: String!
    $discriminator: String!
  ) {
    sendFriendRequestByUsername(
      username: $username
      discriminator: $discriminator
    ) {
      created_at
    }
  }
`;

interface SendFriendRequestByUsernameData {
  sendFriendRequestByUsername: {
    created_at: string;
  };
}

interface SendFriendRequestByUsernameVariables {
  username: string;
  discriminator: string;
}

export default function useSendFriendRequest(
  options?: MutationHookOptions<NoInfer<any>, NoInfer<any>, any, any>
) {
  const [mutateById] = useMutation<
    SendFriendRequestData,
    SendFriendRequestVariables
  >(SEND_FRIEND_REQUEST, options);
  const [mutateByUsername] = useMutation<
    SendFriendRequestByUsernameData,
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
