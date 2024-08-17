import { QueryHookOptions, useQuery } from '@apollo/client';

import { GET_ME, GetMeData } from '../queries/getMe';

export default function useMe(
  options?: QueryHookOptions<NoInfer<any>, NoInfer<any>>
) {
  const { data, loading, error } = useQuery<GetMeData>(GET_ME, options);
  return { data, loading, error };
}
