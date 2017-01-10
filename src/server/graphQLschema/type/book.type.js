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

import mongoose from 'mongoose';
import GraphQLDate from 'graphql-date';

import SnippetType from './snippet.type';

const Snippet = mongoose.model('Snippet');

const BookType = new GraphQLObjectType({
  name: 'Book',
  description: 'BookType of Recbook',
  fields: () => ({
    _id: { type: GraphQLString },
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
      type: SnippetType,
      resolve: (source, args, { user }) => {
        return Snippet.find({ _id: source.author });
      },
    },
    otherSnippets: {
      type: SnippetType,
      resolve: (source, args, { user }) => {

      },
    },
  }),
});

export default BookType;
