import { QueryHookOptions, useQuery } from '@apollo/client';

import { GET_USER } from '../queries/getUser';

export default function useUser(
  userId: string,
  options?: QueryHookOptions<NoInfer<any>, NoInfer<any>>
) {
  const { data, loading, error } = useQuery(GET_USER, {
    ...options,
    variables: { userId },
    skip: !userId,
  });
  return { data, loading, error };
}
