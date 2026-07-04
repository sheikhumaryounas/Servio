import mongoose from 'mongoose';

export async function connectMongo(uri) {
  const mongoUri = uri || process.env.MONGO_URI || 'mongodb://localhost:27017/servio';
  if (mongoose.connection.readyState) {
    return mongoose.connection;
  }
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');
    return mongoose.connection;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
}

export default connectMongo;
