import { gql, TypedDocumentNode } from '@apollo/client';

import { LimitOffsetResult } from '@/types/api';

export interface GetFriendRequestsResult {
  userFriendRequests: LimitOffsetResult<{
    sender: {
      id: string;
      username: string;
      discriminator: string;
      profile_pic_url: string;
    };
    receiver: {
      id: string;
      username: string;
      discriminator: string;
      profile_pic_url: string;
    };
    created_at: string;
  }>;
}

export interface GetFriendRequestsVariables {
  query: {
    type?: string;
    orderBy?: string;
    orderDirection?: string;
    after?: string;
    first?: number;
  };
}

const GET_FRIEND_REQUESTS: TypedDocumentNode<
  GetFriendRequestsResult,
  GetFriendRequestsVariables
> = gql`
  query GetFriendRequests($query: UserFriendRequestsInput) {
    userFriendRequests(query: $query) {
      data {
        sender {
          id
          username
          discriminator
          profile_pic_url
        }
        receiver {
          id
          username
          discriminator
          profile_pic_url
        }
        created_at
      }
      meta {
        totalCount
        page
        pageSize
        totalPages
      }
    }
  }
`;

export default GET_FRIEND_REQUESTS;
