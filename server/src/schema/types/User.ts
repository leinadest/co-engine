import gql from 'graphql-tag';

export default gql`
  type User {
    id: ID!
    created_at: DateTime!
    username: String!
    email: String!
    password_hash: String!
  }
`;
