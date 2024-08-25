import { QueryHookOptions, useQuery } from '@apollo/client';

import GET_FRIENDS, {
  GetFriendsResult,
  GetFriendsVariables,
} from '@/graphql/queries/getFriends';

interface useFriendsArgs
  extends QueryHookOptions<GetFriendsResult, GetFriendsVariables> {
  status?: 'online' | 'offline';
}

export default function useFriends(options?: useFriendsArgs) {
  const { data, loading, error } = useQuery(GET_FRIENDS, {
    ...options,
    variables: { query: { status: options?.status } },
  });
  return { data: data?.friends, loading, error };
}
