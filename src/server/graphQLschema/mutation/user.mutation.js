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

import bcrypt from 'bcrypt';

import jwtUtil from '../../util/jwt.util';
import admin from '../../util/firebase.util';
import refUtil from '../../util/ref.util';

import UserType from '../type/user.type';

const SALT_WORK_FACTOR = 10;

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
    mutateAndGetPayload: ({ email, password, name }, args2, args3) => {
      let id = '';
      let accessToken = '';
      return new Promise((resolve, reject) => {
        admin.auth().createUser({
          email: email,
          emailVerified: false,
          password: password,
          displayName: name,
          disabled: false,
        })
          .then((createdUser) => {
            id = createdUser.uid;
            accessToken = jwtUtil.createAccessToken({
              id: id,
              email: createdUser.email,
              name: createdUser.displayName,
            });
            return bcrypt.genSalt(SALT_WORK_FACTOR)
              .then((salt) => {
                  return bcrypt.hash(password, salt);
                })
              .then((hash) => {
                return refUtil.usersRef.child(id).set({
                  id: id,
                  email: email,
                  name: name,
                  password: hash,
                  createdAt: Date.now(),
                  preference: {
                    colorTheme: 'CLASSIC',
                    remindEmail: false
                  },
                });
              });
          })
          .then(() => {
            resolve({ accessToken: accessToken });
          })
          .catch(reject);
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
      let accessToken = '';
      return new Promise((resolve, reject) => {
        admin.auth().getUserByEmail(email)
          .then(function (userRecord) {
            accessToken = jwtUtil.createAccessToken({
              id: userRecord.uid,
              email: userRecord.email,
              name: userRecord.displayName,
            });
            return refUtil.usersRef.child(userRecord.uid).once('value');
          })
          .then((snapshot) => {
            return bcrypt.compare(password, snapshot.val().password);
          })
          .then((isMatch) => {
            if (isMatch) {
              resolve({ accessToken: accessToken });
            } else {
              reject('wrong password');
            }
          })
          .catch(reject);
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
          { id: user.id },
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
      return refUtil.usersRef.child(user.id).child('preference').child('colorTheme').set(colorTheme)
        .then(() => refUtil.usersRef.child(user.id).once('value'))
        .then((snap) => snap.val())
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
      return refUtil.usersRef.child(user.id).child('preference').child('remainEmail').set(remindEmail)
        .then(() => refUtil.usersRef.child(user.id).once('value'))
        .then((snap) => snap.val())
    },
  }),
};

export default UserMutation;
