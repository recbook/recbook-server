import refUtil from '../../util/ref.util';
import UserType from '../type/user.type';

const ViewerQuery = {
  viewer: {
    description: 'Logged in viewer.',
    type: UserType,
    resolve: (source, _, { user }) => {
      return new Promise((resolve, reject) => {
        if (user) {
          refUtil.usersRef.child(user.id).once('value')
            .then((snap) => {
              resolve({ id: snap.key, ...snap.val() });
            });
        } else {
          reject('jwt must be provided.');
        }
      });
    },
  },
};

export default ViewerQuery;
