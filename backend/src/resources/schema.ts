import { makeExecutableSchema } from '@graphql-tools/schema';

const Query = `
  type Query {
    test: Boolean
  }
`;

const resolvers = {
  Query: {
    test: async () => true,
  },
};

export default makeExecutableSchema({ typeDefs: [Query], resolvers });
