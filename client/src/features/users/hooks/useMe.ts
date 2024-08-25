import { QueryHookOptions, useQuery } from '@apollo/client';

import {
  GET_ME,
  GetMeResult,
  GetMeVariables,
} from '../../../graphql/queries/getMe';

export default function useMe(
  options?: QueryHookOptions<GetMeResult, GetMeVariables>
) {
  const { data, loading, error, fetchMore } = useQuery(GET_ME, {
    ...options,
    notifyOnNetworkStatusChange: true,
  });

  function fetchMoreChats() {
    const canFetchMore = data?.me.chats.pageInfo.hasNextPage && !loading;
    const endCursor = data?.me.chats.pageInfo.endCursor;

    if (!canFetchMore) return;

    fetchMore({
      variables: { chatsQuery: { after: endCursor } },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        const newEdges = fetchMoreResult?.me.chats.edges;
        const newPageInfo = fetchMoreResult?.me.chats.pageInfo;
        return {
          ...previousResult,
          me: {
            ...previousResult.me,
            chats: {
              ...previousResult.me.chats,
              edges: [...previousResult.me.chats.edges, ...newEdges],
              pageInfo: newPageInfo,
            },
          },
        };
      },
    });
  }

  return { data: data?.me, loading, error, fetchMoreChats };
}
