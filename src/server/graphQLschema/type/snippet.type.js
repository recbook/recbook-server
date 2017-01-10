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

import BookType from './book.type';
import UserType from './user.type';

const BookModel = mongoose.model('Book');
const UserModel = mongoose.model('User');

const SnippetType = new GraphQLObjectType({
  name: 'Snippet',
  description: 'SnippetType of Recbook',
  fields: () => ({
    _id: { type: GraphQLString },
    author: {
      type: UserType,
      resolve: (source, args, { user }) => {
        return UserModel.findOne({ _id: source.author });
      },
    },
    book: {
      type: BookType,
      resolve: (source, args, { user }) => {
          return BookModel.findOne({ _id: source.author });
        },
    },
    contents: { type: GraphQLString },
    page: { type: GraphQLInt },
    imageUrl: { type: GraphQLString },
    likesCount: { type: GraphQLInt },
    createdAt: { type: GraphQLDate },
  }),
});

export default SnippetType;
