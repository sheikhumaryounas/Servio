import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  description: { type: String, default: '' },
  requestId: { type: String, default: null },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Transaction', transactionSchema);
