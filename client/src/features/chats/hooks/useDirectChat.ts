import { QueryHookOptions, useQuery } from '@apollo/client';

import GET_DIRECT_CHAT, {
  GetDirectChatData as GetDirectChatResult,
  GetDirectChatVariables,
} from '../../../graphql/queries/getDirectChat';

export default function useDirectChat(
  userId: string,
  options?: QueryHookOptions<GetDirectChatResult, GetDirectChatVariables>
) {
  const { data, loading, error } = useQuery(GET_DIRECT_CHAT, {
    ...options,
    variables: { userId },
    skip: !userId,
  });

  return {
    directChat: data?.directChat,
    loading,
    error,
  } as const;
}
