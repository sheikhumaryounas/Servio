import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  email: { type: String, index: true },
  phone: String,
  password: String,
  role: String,
  profilePic: String,
  walletBalance: { type: Number, default: 0 },
  createdAt: Date,
  updatedAt: Date
}, { collection: 'users' });

export default mongoose.models.User || mongoose.model('User', UserSchema);
