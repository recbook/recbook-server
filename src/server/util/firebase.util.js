import admin from 'firebase-admin';

const serviceAccount = require(`../../../${process.env.FIREBASE_SERVICE_ACCOUNT_JSON}`);
const adminOption = {
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_URL
};

admin.initializeApp(adminOption);

const refs = {
  booksRef: admin.database().ref('/books'),
  bookSearchRef: admin.database().ref('/bookSearch'),
  myLibraryRef: admin.database().ref('/userProperties/myLibrary'),
  snippetsRef: admin.database().ref('/snippets'),
  savedRef: admin.database().ref('/userProperties/saved'),
  trashRef: admin.database().ref('/userProperties/snippetTrash'),
  usersRef: admin.database().ref('/users')
};

export default class firebase {
  static get admin() {
    return admin;
  }

  static get refs() {
    return refs;
  }

}
