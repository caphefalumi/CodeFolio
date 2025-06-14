
import mongoose from 'mongoose';
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/admin');

    console.log("OK");
    console.log('MongoDB Connected...');

  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
};
connectDB();
export default connectDB;