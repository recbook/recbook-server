import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
const SALT_WORK_FACTOR = 10;

const preferenceSchema = new mongoose.Schema({
  _id: false,
  colorTheme: {
    type: String,
    default: 'CLASSIC',
  },
  remindEmail: {
    type: Boolean,
    default: false,
  },
});

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: String,
  profileImageUrl: String,
  myLibraryBooks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
  }],
  savedBooks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
  }],
  likedSnippets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Snippet',
  }],
  snippetTrash: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Snippet',
  }],
  preference: {
    type: preferenceSchema,
    default: {
      colorTheme: 'CLASSIC',
      remindEmail: false,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

});

UserSchema.pre('save', function (next) {
  let user = this;

  if (!user.isModified('password')) return next();
  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });

});

UserSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

export default UserSchema;
