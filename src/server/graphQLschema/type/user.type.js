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

import refUtil from '../../util/ref.util';
import BookType from './book.type';
import SnippetType from './snippet.type';

const { connectionType: UserBookConnection } = connectionDefinitions({ nodeType: BookType });
const { connectionType: UserSnippetConnection } = connectionDefinitions({ nodeType: SnippetType });

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
        return refUtil.myLibraryRef.child(user.id)
          .orderByKey()
          .startAt(args.after ? args.after : '')
          .limitToFirst(args.first ? args.first : 100)
          .once('value')
          .then((snap) => {
            const data = snap.val();
            const promises = data ?
              Object.keys(data).map((key) => refUtil.booksRef.child(key).once('value')
                .then(snap => snap.val())) : [];
            return Promise.all(promises);
          })
          .then((snaps) => connectionFromArray(snaps, args));
      },
    },
    savedBooks: {
      name: 'savedBooks',
      type: UserBookConnection,
      args: connectionArgs,
      resolve: (source, args, { user }) => {
        return refUtil.savedRef.child(user.id)
          .orderByKey()
          .startAt(args.after ? args.after : '')
          .limitToFirst(args.first ? args.first : 100)
          .once('value')
          .then((snap) => {
            const data = snap.val();
            const promises = data ?
              Object.keys(data).map((key) => refUtil.booksRef.child(key).once('value')
                .then(snap => snap.val())) : [];
            return Promise.all(promises);
          })
          .then((snaps) => connectionFromArray(snaps, args));
      },
    },
    recommendedBooks: {
      name: 'recommendedBooks',
      type: UserBookConnection,
      args: connectionArgs,
      resolve: (source, args, { user }) => {
        return refUtil.booksRef
          .orderByKey()
          .startAt(args.after ? args.after : '')
          .limitToFirst(args.first ? args.first : 100)
          .once('value')
          .then((snap) => {
            const data = snap.val();
            const promises = data ?
              Object.keys(data).map((key) => refUtil.booksRef.child(key).once('value')
                .then(snap => snap.val())) : [];
            return Promise.all(promises);
          })
          .then((snaps) => connectionFromArray(snaps, args))
      },
    },
    snippetTrash: {
      name: 'snippetTrash',
      type: UserSnippetConnection,
      args: connectionArgs,
      resolve: (source, args, { user }) => {
        return refUtil.trashRef.child(user.id)
          .orderByKey()
          .startAt(args.after ? args.after : '')
          .limitToFirst(args.first ? args.first : 100)
          .once('value')
          .then((snap) => {
            const data = snap.val();
            const promises = data ?
              Object.keys(data).map((key) => refUtil.snippetsRef.child(key).once('value')
                .then(snap => snap.val())) : [];
            return Promise.all(promises);
          })
          .then((snaps) => connectionFromArray(snaps, args));
      },
    },
    preference: {
      type: PreferenceType,
    },
  }),
});

const PreferenceType = new GraphQLObjectType({
  name: 'Preference',
  description: 'PreferenceType of Recbook',
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
