import {
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLEnumType,
  GraphQLNonNull,
  GraphQLInterfaceType,
  GraphQLBoolean,
} from 'graphql';
import {
  connectionArgs,
  connectionFromArray,
  connectionDefinitions,
} from 'graphql-relay';

import GraphQLDate from 'graphql-date';

import refUtil from '../../util/ref.util';
import SnippetType from './snippet.type';

const BookType = new GraphQLObjectType({
  name: 'Book',
  description: 'BookType of Recbook',
  fields: () => ({
    id: { type: GraphQLString },
    title: { type: GraphQLString },
    author: { type: GraphQLString },
    category: { type: GraphQLString },
    isbn: { type: GraphQLString },
    coverImageUrl: { type: GraphQLString },
    coverImageColor: { type: GraphQLString },
    publishedAt: { type: GraphQLDate },
    crawledAt: { type: GraphQLDate },
    savedCount: { type: GraphQLInt },
    isSaved: {
      type: GraphQLBoolean,
      resolve: (source, args, { user }) => {
      },
    },
    mySnippets: {
      type: new GraphQLList(SnippetType),
      resolve: (source, args, { user }) => {
      },
    },
    otherSnippets: {
      type: new GraphQLList(SnippetType),
      resolve: (source, args, { user }) => {
      },
    },
  }),
});

export default BookType;
