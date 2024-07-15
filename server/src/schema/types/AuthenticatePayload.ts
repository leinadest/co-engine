import gql from 'graphql-tag';

export default gql`
  type AuthenticatePayload {
    user: User!
    accessToken: String!
    expiresAt: DateTime!
  }
`;
