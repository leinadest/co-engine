import gql from 'graphql-tag';
import { merge } from 'lodash';

import queries from './queries';
import mutations from './mutations';
import { type IMessage } from '../message/model';
import { type Context } from '../../config/apolloServer';

const typeDefs = gql`
  type Reaction {
    reactor_id: ID!
    reaction: String!
  }

  type Message {
    id: ID!
    context_type: String!
    context_id: String!
    creator: User!
    formatted_created_at: String!
    formatted_edited_at: String
    content: String!
    reactions: [Reaction]!
  }

  type MessageEdge {
    cursor: String!
    node: Message!
  }

  type MessageConnection {
    edges: [MessageEdge!]!
    pageInfo: PageInfo!
  }
`;

const resolvers = {
  Message: {
    creator: async (message: IMessage, _: any, { dataSources }: Context) => {
      return await dataSources.usersDB.getUserById(message.creator_id);
    },
  },
};

export default {
  typeDefs: [typeDefs, queries.typeDefs, mutations.typeDefs],
  resolvers: merge(resolvers, queries.resolvers, mutations.resolvers),
};
