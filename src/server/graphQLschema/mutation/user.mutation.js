import {
  GraphQLBoolean,
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

const UserModel = mongoose.model('User');

const UserMutation = {
  createUser: mutationWithClientMutationId({
    name: 'createUser',
    inputFields: {
      email: { type: new GraphQLNonNull(GraphQLString) },
      name: { type: new GraphQLNonNull(GraphQLString) },
      password: { type: new GraphQLNonNull(GraphQLString) },
    },
    outputFields: {
      accessToken: {
        type: GraphQLString,
        resolve: (payload) => payload.accessToken,
      },
    },
    mutateAndGetPayload: (args, args2, args3) => {
      return new Promise((resolve, reject) => {
        UserModel.create(args)
          .then((user)=> {
            resolve({ accessToken: jwtUtil.createAccessToken(user) });
          })
          .catch((err)=> {
            reject(err);
          });
      });
    },
  }),
  getToken: mutationWithClientMutationId({
    name: 'getToken',
    inputFields: {
      email: { type: new GraphQLNonNull(GraphQLString) },
      password: { type: new GraphQLNonNull(GraphQLString) },
    },
    outputFields: {
      accessToken: {
        type: GraphQLString,
        resolve: (payload) => payload.accessToken,
      },
    },
    mutateAndGetPayload: ({ email, password }) => {
      return new Promise((resolve, reject) => {
        UserModel.findOne({ email: email })
          .then((user) => {
            if (user) {
              user.comparePassword(password, (err, isMatch) => {
                if (isMatch) {
                  return resolve({ accessToken: jwtUtil.createAccessToken(user) });
                }

                return reject('Wrong password.');
              });
            } else {
              return reject('Not registered.');
            }
          })
          .catch((err) => {
            reject(err.message);
          });
      });
    },
  }),

  /// TODO: Implement image upload feature with GraphQL
  uploadProfileImage: mutationWithClientMutationId({
    name: 'uploadProfileImage',
    inputFields: {
      profileImageUrl: { type: new GraphQLNonNull(GraphQLString) },
    },
    outputFields: {
      user: {
        type: UserType,
        resolve: (payload) => payload,
      },
    },
    mutateAndGetPayload: ({ profileImageUrl }, { user }) => {
      return UserModel
        .findOneAndUpdate(
          { _id: user._id },
          { profileImageUrl },
          { new: true }
        );
    },
  }),
  updateColorTheme: mutationWithClientMutationId({
    name: 'updateColorTheme',
    inputFields: {
      colorTheme: { type: new GraphQLNonNull(GraphQLString) },
    },
    outputFields: {
      user: {
        type: UserType,
        resolve: (payload) => payload,
      },
    },
    mutateAndGetPayload: ({ colorTheme }, { user }) => {
      return UserModel
        .findOneAndUpdate(
          { _id: user._id },
          { $set: { 'preference.colorTheme': colorTheme }},
          { new: true }
        );
    },
  }),
  updateRemindEmail: mutationWithClientMutationId({
    name: 'updateRemindEmail',
    inputFields: {
      remindEmail: { type: new GraphQLNonNull(GraphQLBoolean) },
    },
    outputFields: {
      user: {
        type: UserType,
        resolve: (payload) => payload,
      },
    },
    mutateAndGetPayload: ({ remindEmail }, { user }) => {
      return new Promise((resolve, reject) => {
        UserModel
          .findOneAndUpdate(
            { _id: user._id },
            { $set: { 'preference.remindEmail': remindEmail } },
            { new: true }
          )
          .then((updatedUser) =>  UserModel.findOne({ _id: updatedUser._id }))
          .then(resolve)
          .catch(reject);
      });
    },
  }),
};

export default UserMutation;
