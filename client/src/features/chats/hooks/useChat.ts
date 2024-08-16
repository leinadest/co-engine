import { gql, QueryHookOptions, useQuery } from '@apollo/client';

const GET_CHAT = gql`
  query GetChat($id: ID!) {
    chat(id: $id) {
      id
      name
      picture
      users {
        id
        username
        profile_pic
      }
      messages {
        edges {
          cursor
          node {
            id
            creator {
              id
              username
              profile_pic
            }
            formatted_created_at
            formatted_edited_at
            content
            reactions {
              reactor_id
              reaction
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export default function useChat(
  chatId: string,
  options: QueryHookOptions<NoInfer<any>, NoInfer<any>> = {}
) {
  const result = useQuery(GET_CHAT, {
    variables: { id: chatId },
    ...options,
  });

  return result;
}
