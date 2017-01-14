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

import UserType from '../type/user.type';
import SnippetType from '../type/snippet.type';

import refUtil from '../../util/ref.util';

const SnippetMutation = {
  createSnippet: mutationWithClientMutationId({
    name: 'createSnippet',
    inputFields: {
      book: { type: new GraphQLNonNull(GraphQLString) },
      contents: { type: new GraphQLNonNull(GraphQLString) },
      page: { type: new GraphQLNonNull(GraphQLInt) },
      imageUrl: { type: new GraphQLNonNull(GraphQLString) },
    },
    outputFields: {
      user: {
        type: UserType,
        resolve: (payload) => payload,
      },
    },
    mutateAndGetPayload: (args, { user }) => {
        const newRef = refUtil.snippetsRef.push();
        const newKey = newRef.key;
        return newRef.set({ id: newKey, author: user.id, ...args })
          .then(() => refUtil.savedRef.child(user.id).child(args.book).remove())
          .then(() => refUtil.myLibraryRef.child(user.id).child(args.book).set(true))
          .then(() => refUtil.usersRef.child(user.id).once('value'))
          .then((snap) => snap.val());
      },
  }),
  toTrash: mutationWithClientMutationId({
    name: 'toTrash',
    inputFields: {
      snippetId: { type: new GraphQLNonNull(GraphQLString) },
    },
    outputFields: {
      user: {
        type: UserType,
        resolve: (payload) => payload,
      },
    },
    mutateAndGetPayload: ({ snippetId }, { user }) => {
      return refUtil.trashRef.child(user.id).child(snippetId).set(true)
        .then(() => refUtil.usersRef.child(user.id).once('value'))
        .then((snap) => snap.val());
    },
  }),
};

export default SnippetMutation;
