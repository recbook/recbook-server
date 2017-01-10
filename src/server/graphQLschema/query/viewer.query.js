import mongoose from 'mongoose';

import UserType from '../type/user.type';
const UserModel = mongoose.model('User');

const ViewerQuery = {
  viewer: {
    description: 'Logged in viewer.',
    type: UserType,
    resolve: (source, _, { user }) => {
      return new Promise((resolve, reject) => {
        if (user) {
          return UserModel.findOne({ _id: user._id })
            .then((user)=> {
              if (user) {
                resolve(user);
              } else {
                reject('No user.');
              }
            })
            .catch((err)=> {
              reject(err.message);
            });
        }

        reject('jwt must be provided.');
      });
    },
  },
};

export default ViewerQuery;
