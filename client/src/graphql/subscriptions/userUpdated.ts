import { TypedDocumentNode, gql } from '@apollo/client';

export interface UserUpdatedSubscriptionResult {
  userUpdated: {
    id: string;
    username: string;
    discriminator: string;
    last_login_at: string;
    is_online: boolean;
    profile_pic_url: string;
  };
}

export interface UserUpdatedSubscriptionVariables {
  userIds: string[];
}

const USER_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  UserUpdatedSubscriptionResult,
  UserUpdatedSubscriptionVariables
> = gql`
  subscription UserUpdatedSubscription($userIds: [ID!]!) {
    userUpdated(userIds: $userIds) {
      id
      username
      discriminator
      last_login_at
      is_online
      profile_pic_url
    }
  }
`;

export default USER_UPDATED_SUBSCRIPTION;
