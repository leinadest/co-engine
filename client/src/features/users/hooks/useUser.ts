import { QueryHookOptions, useQuery } from '@apollo/client';

import {
  GET_USER,
  GetUserResult,
  GetUserVariables,
} from '../../../graphql/queries/getUser';

export default function useUser(
  userId?: string,
  options?: QueryHookOptions<GetUserResult, GetUserVariables>
) {
  const { data, loading, error } = useQuery(GET_USER, {
    ...options,
    ...(userId && { variables: { userId } }),
    skip: !userId,
  });
  return { data, loading, error };
}
