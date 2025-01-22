// lib/mongodb.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

// Global is used to prevent multiple instances of mongoose in development
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    console.log('Using cached database connection');
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    }).then((mongoose) => {
      console.log('Connected to MongoDB');
      return mongoose;
    });
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
}
