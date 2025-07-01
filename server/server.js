import express from "express"
import mongoose from "mongoose"
import cookieParser from "cookie-parser"
import cors from "cors"
import "dotenv/config"

import userRoutes from "./routes/userRoutes.js"
import postRoutes from "./routes/postRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import uploadRoutes from "./routes/uploadRoutes.js"

const app = express()

const corsOptions = {
	origin: ["https://localhost:3000", "https://codefolio-phi.vercel.app"],
	credentials: true,
}

app.use(cors(corsOptions))

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)

const db = mongoose.connection
db.on("error", console.error.bind(console, "MongoDB connection error:"))
db.once("open", () =>
	console.log(`MongoDB connected to ${process.env.MONGODB_URI} successfully`)
)

// Apply middleware in correct order
app.use(cookieParser()) // Parse cookies first
app.use(express.json({ limit: "50mb" })) // Parse JSON bodies
app.use(express.urlencoded({ limit: "50mb", extended: true })) // Parse URL-encoded bodies

// Apply routes
app.use("/api/users", userRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/upload", uploadRoutes)

// Start server
app.listen(process.env.SERVER_PORT, () => {
	console.log(`Server is running on port ${process.env.SERVER_PORT}`)
})
export default app
