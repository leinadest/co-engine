import GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import gql from 'graphql-tag';

const resolvers = {
  Upload: GraphQLUpload,
};

const typeDefs = gql`
  scalar Upload
`;

export default { resolvers, typeDefs };
