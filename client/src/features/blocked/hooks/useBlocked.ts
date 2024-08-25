import { QueryHookOptions, useQuery } from '@apollo/client';

import GET_BLOCKED, {
  GetBlockedData as GetBlockedResult,
  GetBlockedVariables,
} from '../../../graphql/queries/getBlocked';

export default function useBlocked(
  options?: QueryHookOptions<GetBlockedResult, GetBlockedVariables>
) {
  const { data, loading, error } = useQuery(GET_BLOCKED, options);
  return { data, loading, error };
}
