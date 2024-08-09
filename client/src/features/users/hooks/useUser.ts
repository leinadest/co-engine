import { gql, useQuery } from '@apollo/client';

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

export default function useUser() {
  const result = useQuery(GET_ME, {
    fetchPolicy: 'cache-and-network',
  });

  return result;
}
