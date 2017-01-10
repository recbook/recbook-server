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
import SnippetType from './snippet.type';

const BookModel = mongoose.model('Book');
const SnippetModel = mongoose.model('Snippet');

const UserType = new GraphQLObjectType({
  name: 'User',
  description: 'UserType of Recbook',
  fields: () => ({
    _id: { type: GraphQLString },
    email: { type: GraphQLString },
    name: { type: GraphQLString },
    createdAt: { type: GraphQLDate },
    myLibraryBooks: {
      type: new GraphQLList(BookType),
      resolve: (source, args, { user }) => {
        return BookModel.find({ _id: { $in: source.myLibraryBooks } });
      },
    },
    savedBooks: {
      type: new GraphQLList(BookType),
      resolve: (source, args, { user }) => {
        return BookModel.find({ _id: { $in: source.savedBooks } });
      },
    },
    recommendedBooks: {
      type: new GraphQLList(BookType),
      resolve: (source, args, { user }) => {
        return BookModel.find();
      },
    },
    snippetTrash: {
      type: new GraphQLList(SnippetType),
      resolve: (source, args, { user }) => {
        return SnippetModel.find({ _id: { $in: source.snippetTrash } });
      },
    },
    preference: {
      type: PreferenceType,
    },
  }),
});

const PreferenceType = new GraphQLObjectType({
  name: 'Preference',
  description: 'UserType of Recbook',
  fields: () => ({
    colorTheme: {
      type: GraphQLString,
    },
    remindEmail: {
      type: GraphQLBoolean,
    },
  }),
});

export default UserType;
