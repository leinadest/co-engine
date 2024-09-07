import { QueryHookOptions, useQuery } from '@apollo/client';

import {
  GET_CHAT,
  GetChatData as GetChatResult,
  GetChatVariables,
} from '../../../graphql/queries/getChat';

export default function useChat(
  options?: QueryHookOptions<GetChatResult, GetChatVariables>
) {
  const { data, loading, error, refetch, fetchMore, variables } = useQuery(
    GET_CHAT,
    {
      ...options,
      notifyOnNetworkStatusChange: true,
      skip: !options?.variables?.id,
    }
  );

  function fetchMoreMessages() {
    const canFetchMore = data?.chat.messages.pageInfo.hasNextPage && !loading;
    if (!canFetchMore) return;

    const endCursor = data?.chat.messages.pageInfo.endCursor;
    fetchMore({ variables: { ...variables, after: endCursor } });
  }

  return { data: data?.chat, loading, error, refetch, fetchMoreMessages };
}
