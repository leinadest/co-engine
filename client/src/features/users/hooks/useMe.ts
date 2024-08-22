import { QueryHookOptions, useQuery } from '@apollo/client';

import { GET_ME } from '../queries/getMe';

export default function useMe(
  options?: QueryHookOptions<NoInfer<any>, NoInfer<any>>
) {
  const { data, loading, error } = useQuery(GET_ME, options);
  return { me: data?.me, loading, error };
}
