import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-content-db';
    
    await mongoose.connect(uri);
    
    console.log('✅ MongoDB Connected Successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
  } catch (error) {
    console.error('MongoDB Disconnection Error:', error);
  }
};
