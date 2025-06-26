import express from 'express'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'

import userRoutes from './routes/userRoutes.js'
import postRoutes from './routes/postRoutes.js'
import authRoutes from './routes/authRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'

const app = express()

// Configure CORS to handle credentials and cookies properly
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    // Define allowed origins
    const allowedOrigins = [
      'https://localhost:3000', // Alternative dev port
      'http://127.0.0.1:3000',
      // Add your production domains here
    ]
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.warn(`CORS blocked origin: ${origin}`)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true, // Enable cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
  optionsSuccessStatus: 200 // For legacy browser support
}

// Apply CORS before other middleware
app.use(cors(corsOptions))

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)

const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))
db.once('open', () => console.log('MongoDB connected successfully'))

// Apply middleware in correct order
app.use(cookieParser()) // Parse cookies first
app.use(express.json({limit: '50mb'})) // Parse JSON bodies
app.use(express.urlencoded({limit: '50mb', extended: true})) // Parse URL-encoded bodies

// Apply routes
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/upload', uploadRoutes)

// Start server
app.listen(process.env.SERVER_PORT, () => {
  console.log(`Server is running on port ${process.env.SERVER_PORT}`)
})
