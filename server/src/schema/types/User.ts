import gql from 'graphql-tag';

export default gql`
  type User {
    id: ID!
    email: String!
    username: String!
    discriminator: String!
    password_hash: String!
    created_at: DateTime!
    last_login_at: DateTime
    profile_pic: String
    bio: String
  }
`;
