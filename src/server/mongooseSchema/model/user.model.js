import mongoose from 'mongoose';
import UserSchema from '../schema/user.schema';

const User = mongoose.model('User', UserSchema);

//set up mockup data
User.remove().then(() => {
  for (let i = 0; i < 100; i++) {
    User.create(new User({
      name: `UserType22${i}`,
      password: `secretrererer`,
      email: `lyw22${i}@naver.com`,
      createdAt: new Date(),
    })).catch((err)=> {
      console.log(err);
    });
  }
});

export default User;
