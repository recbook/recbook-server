import { GraphQLSchema, GraphQLObjectType } from 'graphql';

import UserMutation from './mutation/user.mutation';
import UserQuery from './query/user.query';

const Schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'rootQuery',
    description: 'Root Query of the Recbook Schema',
    fields: () => ({
      ...UserQuery,
    }),
  }),
  mutation: new GraphQLObjectType({
    name: 'rootMutation',
    description: 'Root Mutation of the Recbook Schema',
    fields: () => ({
      ...UserMutation,
    }),
  }),
});

export default Schema;
