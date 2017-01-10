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
import mongoose from 'mongoose';

import jwtUtil from '../../util/jwt.util';
import UserType from '../type/user.type';
import SnippetType from '../type/snippet.type';

const SnippetModel = mongoose.model('Snippet');
const UserModel = mongoose.model('User');

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
      return new Promise((resolve, reject) => {
        SnippetModel.create({ ...args, author: user._id })
          .then((newSnippet) => {
            return UserModel.findOneAndUpdate(
              { _id: user._id },
              { $addToSet: { myLibraryBooks: args.book } },
              { new: true }
            );
          })
          .then((myLibraryProcessedUser) => {
            return UserModel.findOneAndUpdate(
              { _id: user._id },
              { $pull: { savedBooks: args.book } },
              { new: true }
            );
          })
          .then(resolve)
          .catch(reject);
      });
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
      return new Promise((resolve, reject) => {
        UserModel
          .findOneAndUpdate(
            { _id: user._id },
            { $addToSet: { snippetTrash: snippetId } },
            { new: true }
          )
          .then(resolve)
          .catch(reject);
      });
    },
  }),
};

export default SnippetMutation;
