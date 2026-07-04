import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  customerId: { type: String, default: 'anonymous' },
  customerName: { type: String, default: 'Anonymous Customer' },
  rating: { type: Number, min: 1, max: 5, required: true },
  review: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const providerSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  serviceType: { type: [String], default: ['electrician'] },
  isAvailable: { type: Boolean, default: false },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [67.0011, 24.8607] }
  },
  rating: { type: Number, default: 4.8 },
  totalJobs: { type: Number, default: 0 },
  experience: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  badge: { type: String, default: 'Rookie' },
  reviews: { type: [reviewSchema], default: [] },
  lastActive: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Provider', providerSchema);
