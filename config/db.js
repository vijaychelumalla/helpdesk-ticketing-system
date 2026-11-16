import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not defined");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      tlsAllowInvalidCertificates: true,
    });

    isConnected = conn.connections[0].readyState === 1;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
};

export default connectDB;
