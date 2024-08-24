import { QueryHookOptions, useQuery } from '@apollo/client';

import { GET_ME, GetMeResult } from '../queries/getMe';

export default function useMe(options?: QueryHookOptions<GetMeResult>) {
  const { data, loading, error } = useQuery(GET_ME, options);
  return { data: data?.me, loading, error };
}
