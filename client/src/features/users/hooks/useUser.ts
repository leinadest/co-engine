import { gql, QueryHookOptions, useQuery } from '@apollo/client';

const GET_ME = gql`
  query GetMe {
    me {
      id
      created_at
      email
      username
      discriminator
      profile_pic
      bio
      chats {
        edges {
          cursor
          node {
            id
            name
            picture
            last_message_at
            last_message
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

export default function useUser(
  options?: QueryHookOptions<NoInfer<any>, NoInfer<any>>
) {
  const result = useQuery(GET_ME, options);

  return result;
}
