import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
dotenv.config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URL || process.env.MONGO_URI;
    if (!uri) {
      console.error('MONGO_URL or MONGO_URI must be set'.bgRed.white);
      process.exit(1);
    }
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected ${conn.connection.host}`.bgWhite.green);
  } catch (error) {
    console.error(`Error in MongoDB${error}`.bgRed.white);
    process.exit(1);
  }
};
export default connectDB;
