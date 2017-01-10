import mongoose from 'mongoose';
import UserSchema from '../schema/user.schema';

const UserModel = mongoose.model('User', UserSchema);

export default UserModel;
