import mongoose from 'mongoose';
import UserSchema from '../schema/user.schema';

const User = mongoose.model('User', UserSchema);

//set up mockup data
User.remove().then(() => {
  const users = [];
  for (let i = 0; i < 100; i++) {
    User.create(new User({
      name: `UserType22${i}`,
      password: `secretrererer`,
      email: `lyw22${i}@naver.com`,
      phone: '+821062348149',
      point: [(Math.random() - 0.5) * 360, (Math.random() - 0.5) * 180],
      createdAt: new Date(),
      friends: users.map((i) => i._id),
    })).catch((err)=> {
      console.log(err);
    });

  }

});

export default User;
