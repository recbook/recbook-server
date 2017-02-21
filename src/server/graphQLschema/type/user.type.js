import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean
} from 'graphql';
import {
  connectionArgs,
  connectionFromArray,
  connectionDefinitions
} from 'graphql-relay';

import firebase from '../../util/firebase.util';
import BookType from './book.type';
import SnippetType from './snippet.type';

const { connectionType: UserBookConnection } = connectionDefinitions({ nodeType: BookType });
const { connectionType: UserSnippetConnection } = connectionDefinitions({ nodeType: SnippetType });

const PreferenceType = new GraphQLObjectType({
  name: 'Preference',
  description: 'PreferenceType of Recbook',
  fields: () => ({
    colorTheme: {
      type: GraphQLString
    },
    remindEmail: {
      type: GraphQLBoolean
    }
  })
});

const UserType = new GraphQLObjectType({
  name: 'User',
  description: 'UserType of Recbook',
  fields: () => ({
    id: { type: GraphQLString },
    email: { type: GraphQLString },
    name: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    myLibraryBooks: {
      name: 'myLibraryBooks',
      type: UserBookConnection,
      args: connectionArgs,
      resolve: (source, args, { user }) => {
        return Promise.all([
          firebase.refs.myLibraryRef.child(user.id)
            .orderByKey()
            .startAt(args.after ? args.after : '')
            .limitToFirst(args.first ? args.first : 100)
            .once('value'),
          firebase.refs.savedRef.child(user.id)
            .orderByKey()
            .startAt(args.after ? args.after : '')
            .limitToFirst(args.first ? args.first : 100)
            .once('value')
        ])
          .then((BooksIdRefSnap) => {
            const myLibraryData = BooksIdRefSnap[0].val() ? Object.keys(BooksIdRefSnap[0].val()) : null;
            const savedData = BooksIdRefSnap[1].val() ? Object.keys(BooksIdRefSnap[1].val()) : null;
            const data = (myLibraryData && savedData ? new Set(myLibraryData.concat(savedData)) :
              myLibraryData ? myLibraryData : savedData ? savedData : null);
            const promises = data ?
              JSON.parse(JSON.stringify(data)).map((key) => firebase.refs.booksRef.child(key).once('value')
                .then(snap => snap.val())) : [];
            return Promise.all(promises);
          })
          .then((snaps) => connectionFromArray(snaps, args));
      }
    },
    savedBooks: {
      name: 'savedBooks',
      type: UserBookConnection,
      args: connectionArgs,
      resolve: (source, args, { user }) => {
        return firebase.refs.savedRef.child(user.id)
          .orderByKey()
          .startAt(args.after ? args.after : '')
          .limitToFirst(args.first ? args.first : 100)
          .once('value')
          .then((savedBooksIdRefSnap) => {
            const data = savedBooksIdRefSnap.val();
            const promises = data ?
              Object.keys(data).map((key) => firebase.refs.booksRef.child(key).once('value')
                .then(snap => snap.val())) : [];
            return Promise.all(promises);
          })
          .then((snaps) => connectionFromArray(snaps, args));
      }
    },
    recommendedBooks: {
      name: 'recommendedBooks',
      type: UserBookConnection,
      args: connectionArgs,
      resolve: (source, args) => {
        return firebase.refs.booksRef
          .orderByKey()
          .startAt(args.after ? args.after : '')
          .limitToFirst(args.first ? args.first : 100)
          .once('value')
          .then((recommendedBooksIdRefSnap) => {
            const data = recommendedBooksIdRefSnap.val();
            const promises = data ?
              Object.keys(data).map((key) => firebase.refs.booksRef.child(key).once('value')
                .then(snap => snap.val())) : [];
            return Promise.all(promises);
          })
          .then((snaps) => connectionFromArray(snaps, args));
      }
    },
    snippetTrash: {
      name: 'snippetTrash',
      type: UserSnippetConnection,
      args: connectionArgs,
      resolve: (source, args, { user }) => {
        return firebase.refs.trashRef.child(user.id)
          .orderByKey()
          .startAt(args.after ? args.after : '')
          .limitToFirst(args.first ? args.first : 100)
          .once('value')
          .then((snippetTrashIdRefSnap) => {
            const data = snippetTrashIdRefSnap.val();
            const promises = data ?
              Object.keys(data).map((key) => firebase.refs.snippetsRef.child(key).once('value')
                .then(snap => snap.val())) : [];
            return Promise.all(promises);
          })
          .then((snaps) => connectionFromArray(snaps, args));
      }
    },
    preference: {
      type: PreferenceType
    }
  })
});

export default UserType;
