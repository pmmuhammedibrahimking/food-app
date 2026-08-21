import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/aurelia_hotel';
    
    // Configure mongoose connection options
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000 // Fast fail if local MongoDB daemon is offline
    });

    console.log(`🍃 [MongoDB Connected]: Host -> ${conn.connection.host} | DB -> ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`⚠️ [MongoDB Connection Warning]: ${error.message}`);
    console.warn(`⚠️ Running backend in hybrid mode (REST + WebSocket active, in-memory state available).`);
    return null;
  }
};
