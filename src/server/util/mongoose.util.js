import mongoose from 'mongoose';
import '../mongooseSchema/model/user.model';
import '../mongooseSchema/model/book.model';
import '../mongooseSchema/model/snippet.model';

export default {
  connect() {
    mongoose.Promise = global.Promise;
    mongoose.connect(`${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, () => {
      if (process.env.NODE_ENV === 'test') {
        mongoose.connection.db.dropDatabase();
      }
    });
  },
};
