import { GraphQLSchema, GraphQLObjectType } from 'graphql';

import UserMutation from './mutation/user.mutation';
import BookMutation from './mutation/book.mutation';
import SnippetMutation from './mutation/snippet.mutation';
import ViewerQuery from './query/viewer.query';

const Schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'rootQuery',
    description: 'Root Query of the Recbook Schema',
    fields: () => ({
      ...ViewerQuery
    })
  }),
  mutation: new GraphQLObjectType({
    name: 'rootMutation',
    description: 'Root Mutation of the Recbook Schema',
    fields: () => ({
      ...UserMutation,
      ...BookMutation,
      ...SnippetMutation
    })
  })
});

export default Schema;
