import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  providerId: { type: String, default: null },
  serviceType: { type: String, required: true },
  description: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'completed', 'cancelled', 'paid'], 
    default: 'pending' 
  },
  urgency: { type: String, enum: ['Normal', 'Medium', 'High'], default: 'Normal' },
  price: { type: Number, default: 0 },
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date, default: null },
  rating: { type: Number, default: null },
  review: { type: String, default: null },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  address: { type: String, default: '' },
  aiSummary: { type: String, default: '' },
  safetyWarning: { type: String, default: '' },
  checklist: { type: [String], default: [] }
}, { timestamps: true });

export default mongoose.model('Request', requestSchema);
