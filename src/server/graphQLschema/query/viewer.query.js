import firebase from '../../util/firebase.util';
import UserType from '../type/user.type';

const ViewerQuery = {
  viewer: {
    description: 'Logged in viewer.',
    type: UserType,
    resolve: (source, _, { user }) => {
      return new Promise((resolve, reject) => {
        if (user) {
          firebase.refs.usersRef.child(user.id).once('value')
            .then((snap) => {
              resolve({ id: snap.key, ...snap.val() });
            });
        } else {
          // TODO : implement global error handler.
          reject('This query needs access token. Please check header.authorization.');
        }
      });
    }
  }
};

export default ViewerQuery;
