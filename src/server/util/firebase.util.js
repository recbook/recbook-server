import admin from 'firebase-admin';

const serviceAccount = require(`../../../${process.env.FIREBASE_SERVICE_ACCOUNT_JSON}`);
const adminOption = {
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_URL,
};

admin.initializeApp(adminOption);

export default admin;
