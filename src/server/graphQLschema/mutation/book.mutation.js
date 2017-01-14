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
  GraphQLInputObjectType
} from 'graphql';
import {
  mutationWithClientMutationId,
} from 'graphql-relay';

import GraphQLDate from 'graphql-date';

import refUtil from '../../util/ref.util';
import UserType from '../type/user.type';
import BookType from '../type/book.type';

const BookMutation = {
  saveBook: mutationWithClientMutationId({
    name: 'saveBook',
    inputFields: {
      title: { type: new GraphQLNonNull(GraphQLString) },
      isbn: { type:  new GraphQLNonNull(GraphQLString) },
      author: { type: GraphQLString },
      category: { type: GraphQLString },
      coverImageUrl: { type: GraphQLString },
      coverImageColor: { type: GraphQLString },
      publishedAt: { type: GraphQLDate },
    },
    outputFields: {
      user: {
        type: UserType,
        resolve: (payload) => payload,
      },
    },
    mutateAndGetPayload: (args, { user }) => {
      return new Promise((resolve, reject) => {
        refUtil.booksRef
          .orderByChild('isbn')
          .equalTo(args.isbn)
          .once('value')
          .then((snap) => {
            if (snap.val() === null) {
              const newRef = refUtil.booksRef.push();
              const newKey = newRef.key;
              return newRef.set({ id: newKey, ...args })
                .then(() => {
                  return refUtil.booksRef.child(newKey).once('value')
                    .then((snap) => snap.val())
                });
            } else {
              const vals = Object.keys(snap.val()).map((key) => snap.val()[key]);
              return vals[0];
            }
          })
          .then((val) => refUtil.savedRef.child(user.id).child(val.id).set(true))
          .then(() => refUtil.usersRef.child(user.id).once('value'))
          .then((snap)=> resolve(snap.val()))
          .catch(reject);
      });
    },
  }),
  unsaveBook: mutationWithClientMutationId({
    name: 'unsaveBook',
    inputFields: {
      bookId: { type: new GraphQLNonNull(GraphQLString) },
    },
    outputFields: {
      user: {
        type: UserType,
        resolve: (payload) => payload,
      },
    },
    mutateAndGetPayload: ({ bookId }, { user }) => {
      return new Promise((resolve, reject) => {
        refUtil.savedRef.child(user.id).child(bookId).remove()
          .then(() => refUtil.usersRef.child(user.id).once('value'))
          .then((snap)=> resolve(snap.val()))
          .catch(reject);
      });
    },
  }),
};

export default BookMutation;
