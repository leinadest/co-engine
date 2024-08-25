import { RelayConnection } from '@/types/api';
import { gql, TypedDocumentNode } from '@apollo/client';

export interface GetFriendsResult {
  friends: RelayConnection<{
    id: string;
    username: string;
    discriminator: string;
    last_login_at: string;
    is_online: boolean;
    profile_pic_url: string;
  }>;
}

export interface GetFriendsVariables {
  query: {
    status?: string;
    search?: string;
    orderDirection?: string;
    orderBy?: string;
    after?: string;
    first?: number;
  };
}

const GET_FRIENDS: TypedDocumentNode<
  GetFriendsResult,
  GetFriendsVariables
> = gql`
  query GetFriends($query: FriendsInput) {
    friends(query: $query) {
      edges {
        cursor
        node {
          id
          username
          discriminator
          last_login_at
          is_online
          profile_pic_url
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        endCursor
        startCursor
      }
      totalCount
    }
  }
`;

export default GET_FRIENDS;
