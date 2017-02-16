import {
  GraphQLString,
  GraphQLInt,
  GraphQLNonNull
} from 'graphql';
import {
  mutationWithClientMutationId
} from 'graphql-relay';

import UserType from '../type/user.type';

import firebase from '../../util/firebase.util';

const SnippetMutation = {
  createSnippet: mutationWithClientMutationId({
    name: 'createSnippet',
    inputFields: {
      book: { type: new GraphQLNonNull(GraphQLString) },
      contents: { type: new GraphQLNonNull(GraphQLString) },
      page: { type: new GraphQLNonNull(GraphQLInt) },
      imageUrl: { type: new GraphQLNonNull(GraphQLString) }
    },
    outputFields: {
      user: {
        type: UserType,
        resolve: (payload) => payload
      }
    },
    mutateAndGetPayload: (args, { user }) => {
      return new Promise((resolve, reject) => {
        if (user) {
          const newRef = firebase.refs.snippetsRef.push();
          const newKey = newRef.key;
          return newRef.set({
            id: newKey, author: user.id, ...args, createdAt: Date.now(), createdDate: calculateDate()
          })
            .then(() => firebase.refs.savedRef.child(user.id).child(args.book).remove())
            .then(() => firebase.refs.myLibraryRef.child(user.id).child(args.book).set(true))
            .then(() => firebase.refs.usersRef.child(user.id).once('value'))
            .then((snap) => resolve(snap.val()));
        }
        return reject('This mutation needs access token. Please check header.authorization.');
      });
    }
  }),
  toTrash: mutationWithClientMutationId({
    name: 'toTrash',
    inputFields: {
      snippetId: { type: new GraphQLNonNull(GraphQLString) }
    },
    outputFields: {
      user: {
        type: UserType,
        resolve: (payload) => payload
      }
    },
    mutateAndGetPayload: ({ snippetId }, { user }) => {
      return new Promise((resolve, reject) => {
        if (user) {
          return firebase.refs.trashRef.child(user.id).child(snippetId).set(true)
            .then(() => firebase.refs.usersRef.child(user.id).once('value'))
            .then((snap) => resolve(snap.val()));
        }
        return reject('This mutation needs access token. Please check header.authorization.');
      });
    }
  })
};

function calculateDate() {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const today = new Date();
  let day = today.getDate();
  const month = today.getMonth();
  const year = today.getFullYear();
  if (day < 10) day = '0' + day;
  return day + ' ' + monthNames[month] + ' ' + year;
}

export default SnippetMutation;
