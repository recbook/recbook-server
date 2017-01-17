import {
  GraphQLBoolean,
  GraphQLString,
  GraphQLNonNull
} from 'graphql';
import {
  mutationWithClientMutationId
} from 'graphql-relay';

import bcrypt from 'bcrypt';

import jwtUtil from '../../util/jwt.util';
import admin from '../../util/firebase.util';
import firebase from '../../util/firebase.util';

import UserType from '../type/user.type';

const SALT_WORK_FACTOR = 10;

const UserMutation = {
  createUser: mutationWithClientMutationId({
    name: 'createUser',
    inputFields: {
      email: { type: new GraphQLNonNull(GraphQLString) },
      name: { type: new GraphQLNonNull(GraphQLString) },
      password: { type: new GraphQLNonNull(GraphQLString) }
    },
    outputFields: {
      accessToken: {
        type: GraphQLString,
        resolve: (payload) => payload.accessToken
      }
    },
    mutateAndGetPayload: ({ email, password, name }) => {
      let id = '';
      let accessToken = '';
      return new Promise((resolve, reject) => {
        firebase.admin.auth().createUser({
          email: email,
          emailVerified: false,
          password: password,
          displayName: name,
          disabled: false
        })
          .then((createdUser) => {
            id = createdUser.uid;
            accessToken = jwtUtil.createAccessToken({
              id: id,
              email: createdUser.email,
              name: createdUser.displayName
            });
            return bcrypt.genSalt(SALT_WORK_FACTOR)
              .then((salt) => {
                return bcrypt.hash(password, salt);
              })
              .then((hash) => {
                return firebase.refs.usersRef.child(id).set({
                  id: id,
                  email: email,
                  name: name,
                  password: hash,
                  createdAt: Date.now(),
                  preference: {
                    colorTheme: 'CLASSIC',
                    remindEmail: false
                  }
                });
              });
          })
          .then(() => {
            resolve({ accessToken: accessToken });
          })
          .catch(reject);
      });
    }
  }),
  getToken: mutationWithClientMutationId({
    name: 'getToken',
    inputFields: {
      email: { type: new GraphQLNonNull(GraphQLString) },
      password: { type: new GraphQLNonNull(GraphQLString) }
    },
    outputFields: {
      accessToken: {
        type: GraphQLString,
        resolve: (payload) => payload.accessToken
      }
    },
    mutateAndGetPayload: ({ email, password }) => {
      let accessToken = '';
      return new Promise((resolve, reject) => {
        firebase.admin.auth().getUserByEmail(email)
          .then((userRecord) => {
            accessToken = jwtUtil.createAccessToken({
              id: userRecord.uid,
              email: userRecord.email,
              name: userRecord.displayName
            });
            return firebase.refs.usersRef.child(userRecord.uid).once('value');
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
    }
  }),

  updateProfileTmage: mutationWithClientMutationId({
    name: 'updateProfileTmage',
    inputFields: {
      profileImageUrl: { type: new GraphQLNonNull(GraphQLString) }
    },
    outputFields: {
      user: {
        type: UserType,
        resolve: (payload) => payload
      }
    },
    mutateAndGetPayload: ({ profileImageUrl }, { user }) => {
      return new Promise((resolve, reject) => {
        if (user) {
          return firebase.refs.usersRef.child(user.id).child('profileImageUrl').set(profileImageUrl)
            .then(() => firebase.refs.usersRef.child(user.id).once('value'))
            .then((snap) => resolve(snap.val()));
        }
        return reject('This mutation needs access token. Please check header.authorization.');
      });
    }
  }),
  updateColorTheme: mutationWithClientMutationId({
    name: 'updateColorTheme',
    inputFields: {
      colorTheme: { type: new GraphQLNonNull(GraphQLString) }
    },
    outputFields: {
      user: {
        type: UserType,
        resolve: (payload) => payload
      }
    },
    mutateAndGetPayload: ({ colorTheme }, { user }) => {
      return new Promise((resolve, reject) => {
        if (user) {
          return firebase.refs.usersRef.child(user.id).child('preference').child('colorTheme')
            .set(colorTheme)
            .then(() => firebase.refs.usersRef.child(user.id).once('value'))
            .then((snap) => resolve(snap.val()));
        }
        return reject('This mutation needs access token. Please check header.authorization.');
      });
    }
  }),
  updateRemindEmail: mutationWithClientMutationId({
    name: 'updateRemindEmail',
    inputFields: {
      remindEmail: { type: new GraphQLNonNull(GraphQLBoolean) }
    },
    outputFields: {
      user: {
        type: UserType,
        resolve: (payload) => payload
      }
    },
    mutateAndGetPayload: ({ remindEmail }, { user }) => {
      return new Promise((resolve, reject) => {
        if (user) {
          return firebase.refs.usersRef.child(user.id).child('preference').child('remainEmail')
            .set(remindEmail)
            .then(() => firebase.refs.usersRef.child(user.id).once('value'))
            .then((snap) => resolve(snap.val()));
        }
        return reject('This mutation needs access token. Please check header.authorization.');
      });
    }
  })
};

export default UserMutation;
