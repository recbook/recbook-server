import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt
} from 'graphql';

import GraphQLDate from 'graphql-date';

import firebase from '../../util/firebase.util';
import BookType from './book.type';
import UserType from './user.type';

const SnippetType = new GraphQLObjectType({
  name: 'Snippet',
  description: 'SnippetType of Recbook',
  fields: () => ({
    id: { type: GraphQLString },
    author: {
      type: UserType,
      resolve: (source) => {
        return firebase.refs.usersRef.child(source.author).once('value')
          .then((snap) => snap.val());
      }
    },
    book: {
      type: BookType,
      resolve: (source) => {
        return firebase.refs.booksRef.child(source.book).once('value')
            .then((snap) => snap.val());
      }
    },
    contents: { type: GraphQLString },
    page: { type: GraphQLInt },
    imageUrl: { type: GraphQLString },
    createdAt: { type: GraphQLDate },
    createdDate: { type: GraphQLString }
  })
});

export default SnippetType;
