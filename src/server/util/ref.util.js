import admin from './firebase.util';

const utils = {
  usersRef: admin.database().ref('/users'),
  booksRef: admin.database().ref('/books'),
  snippetsRef: admin.database().ref('/snippets'),
  myLibraryRef: admin.database().ref('/userReadable/myLibrary'),
  savedRef: admin.database().ref('/userReadable/saved'),
  trashRef: admin.database().ref('/userReadable/snippetTrash'),
};

export default utils;
