import { TypedDocumentNode, gql } from '@apollo/client';

export interface MessageCreatedSubscriptionResult {
  messageCreated: {
    id: string;
    context_type: string;
    context_id: string;
    creator: {
      id: string;
      username: string;
      discriminator: string;
      profile_pic_url: string;
    };
    formatted_created_at: string;
    content: string;
  };
}

export interface MessageCreatedSubscriptionVariables {
  contextType: string;
  contextId: string;
}

const MESSAGE_CREATED_SUBSCRIPTION: TypedDocumentNode<
  MessageCreatedSubscriptionResult,
  MessageCreatedSubscriptionVariables
> = gql`
  subscription MessageCreatedSubscription(
    $contextType: String!
    $contextId: String!
  ) {
    messageCreated(contextType: $contextType, contextId: $contextId) {
      id
      context_type
      context_id
      creator {
        id
        username
        discriminator
        profile_pic_url
      }
      formatted_created_at
      content
    }
  }
`;

export default MESSAGE_CREATED_SUBSCRIPTION;
