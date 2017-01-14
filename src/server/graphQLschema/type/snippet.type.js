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

import GraphQLDate from 'graphql-date';

import refUtil from '../../util/ref.util';
import BookType from './book.type';
import UserType from './user.type';

const SnippetType = new GraphQLObjectType({
  name: 'Snippet',
  description: 'SnippetType of Recbook',
  fields: () => ({
    id: { type: GraphQLString },
    author: {
      type: UserType,
      resolve: (source, args, { user }) => {
        return refUtil.usersRef.child(source.author).once('value')
          .then((snap) => snap.val());
      },
    },
    book: {
      type: BookType,
      resolve: (source, args, { user }) => {
          return refUtil.booksRef.child(source.book).once('value')
            .then((snap) => snap.val());
        },
    },
    contents: { type: GraphQLString },
    page: { type: GraphQLInt },
    imageUrl: { type: GraphQLString },
    createdAt: { type: GraphQLDate },
  }),
});

export default SnippetType;
