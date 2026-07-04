import mongoose from 'mongoose';
import dns from 'dns';

// Force Node.js to use Google DNS for MongoDB SRV record resolution
// This fixes ISP-level DNS blocking of mongodb.net SRV records
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const connectMongo = async (uri) => {
  if (!uri) {
    throw new Error('MongoDB URI is required to connect. Set DB_URI in your environment.');
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

export default connectMongo;

