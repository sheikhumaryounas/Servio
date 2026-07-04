import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'provider', 'admin'], default: 'customer' },
  profilePic: { type: String, default: null },
  walletBalance: { type: Number, default: 5000 },
  resetOtp: { type: String, default: null },
  resetOtpExpires: { type: Number, default: null },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
