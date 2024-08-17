import { useState } from 'react';
import { ApolloError, QueryHookOptions, useLazyQuery } from '@apollo/client';

import { GetUserData, GET_USER } from '../queries/getUser';

export default function useLazyUser(
  options?: QueryHookOptions<NoInfer<any>, NoInfer<any>>
) {
  const [loadUser] = useLazyQuery<GetUserData>(GET_USER, options);

  const [data, setData] = useState<any>();
  const [loading, setLoading] = useState<boolean>();
  const [error, setError] = useState<ApolloError>();

  async function getUser({
    userId,
    username,
    discriminator,
  }: {
    userId?: string;
    username?: string;
    discriminator?: string;
  }) {
    setLoading(true);
    setError(undefined);

    return loadUser({ variables: { userId, username, discriminator } }).then(
      (res) => {
        setData(res.data);
        setLoading(res.loading);
        setError(res.error);
        return res;
      }
    );
  }

  return { getUser, data, loading, error };
}
