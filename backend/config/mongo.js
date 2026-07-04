import mongoose from 'mongoose';

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
