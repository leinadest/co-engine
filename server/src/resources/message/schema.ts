import gql from 'graphql-tag';
import { merge } from 'lodash';

import queries from './queries';
import mutations from './mutations';

const types = gql`
  type Reaction {
    reactor_id: ID!
    reaction: String!
  }

  type Message {
    id: ID!
    context_type: String!
    context_id: String!
    creator_id: ID!
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

export default {
  typeDefs: [types, queries.typeDefs, mutations.typeDefs],
  resolvers: merge(queries.resolvers, mutations.resolvers),
};
