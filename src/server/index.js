import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';

// import postRoutes from './routes/postRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
const app = express();

mongoose.connect(process.env.MONGODB_URI)
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('MongoDB connected successfully'));

app.use(express.json());

// app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
