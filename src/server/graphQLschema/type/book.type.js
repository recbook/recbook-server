import {
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';
import GraphQLDate from 'graphql-date';

import firebase from '../../util/firebase.util';
import SnippetType from './snippet.type';

const BookType = new GraphQLObjectType({
  name: 'Book',
  description: 'BookType of Recbook',
  fields: () => ({
    id: { type: GraphQLString },
    isbn: { type: GraphQLString },
    title: { type: GraphQLString },
    author: { type: GraphQLString },
    category: { type: GraphQLString },
    thumbnail: { type: GraphQLString },
    thumbnailColor: { type: GraphQLString },
    publisher: { type: GraphQLString },
    publishedDate: { type: GraphQLString },
    crawledAt: { type: GraphQLDate },
    savedCount: { type: GraphQLInt },
    isSaved: {
      type: GraphQLBoolean,
      resolve: (source, args, { user }) => {
        return new Promise((resolve, reject) => {
          // this query works with savedBook! Not recommendedBooks
          return firebase.refs.savedRef.child(user.id).orderByKey().equalTo(source.id).once('value')
            .then((snap) => resolve(!!snap.val()))
            .catch(reject);
        });
      }
    },
    mySnippets: {
      type: new GraphQLList(SnippetType),
      resolve: (source, args, { user }) => {
        return new Promise((resolve, reject) => {
          return firebase.refs.snippetsRef.orderByChild('author').equalTo(user.id).once('value')
            .then((snap) => resolve(snap.val() ?
              Object.keys(snap.val())
                .map((key) => snap.val()[key])
                .filter((obj) => obj.book === source.id) : [])
            )
            .catch(reject);
        });
      }
    },
    otherSnippets: {
      type: new GraphQLList(SnippetType),
      resolve: (source, args, { user }) => {
        return new Promise((resolve, reject) => {
          return firebase.refs.snippetsRef.orderByChild('book').equalTo(source.id).once('value')
            .then((snap) => resolve(snap.val() ?
              Object.keys(snap.val())
                .map((key) => snap.val()[key])
                .filter((obj) => obj.author !== user.id) : [])
            )
            .catch(reject);
        });
      }
    },
    snippets: { type: GraphQLJSON },
  })
});

export default BookType;
