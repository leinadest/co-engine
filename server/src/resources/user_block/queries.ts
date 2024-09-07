import gql from 'graphql-tag';
import * as yup from 'yup';

import { type Context } from '../../config/apolloServer';
import { GraphQLError } from 'graphql';

const typeDefs = gql`
  extend type Query {
    """
    Returns the user blocks of the authenticated user.
    """
    userBlocks(
      search: String
      after: String
      first: Int
      orderBy: String
      orderDirection: String
    ): UserBlockConnection!
  }
`;

interface UserBlocksInput {
  search?: string;
  after?: string;
  first?: number;
  orderBy?: string;
  orderDirection?: string;
}

const userBlocksInputSchema = yup.object().shape({
  search: yup.string().trim(),
  after: yup.string().trim(),
  first: yup
    .number()
    .integer('first must be an integer')
    .min(1, 'first must be greater than or equal to 1'),
  orderBy: yup
    .string()
    .trim()
    .oneOf(
      ['username', 'created_at'],
      'orderBy must be username or created_at'
    ),
  orderDirection: yup
    .string()
    .trim()
    .oneOf(['ASC', 'DESC'], 'orderDirection must be ASC or DESC'),
});

const resolvers = {
  Query: {
    userBlocks: async (
      _: any,
      args: UserBlocksInput,
      { authService, dataSources }: Context
    ) => {
      await userBlocksInputSchema.validate(args);

      if (authService.getUserId() === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return await dataSources.blocksDB.getUserBlocks(args);
    },
  },
};

export default { typeDefs, resolvers };
