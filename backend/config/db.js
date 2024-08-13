import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected ${conn.connection.host}`.bgWhite.green);
  } catch (error) {
    console.error(`Error in MongoDB${error}`.bgRed.white);
    process.exit(1);
  }
};
export default connectDB;
