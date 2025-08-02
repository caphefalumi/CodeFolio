import express from "express"
import mongoose from "mongoose"
import cookieParser from "cookie-parser"
import rateLimit from 'express-rate-limit'
import ExpressMongoSanitize from "express-mongo-sanitize"
import cors from "cors"
import "dotenv/config"

import userRoutes from "./routes/userRoutes.js"
import postRoutes from "./routes/postRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import uploadRoutes from "./routes/uploadRoutes.js"
import notificationRoutes from "./routes/notificationRoutes.js"
import "./utils/refreshTokenCleanup.js"

const app = express()
const PORT = process.env.PORT || 3001
const corsOptions = {
	origin: [
		"http://localhost:3000",
		"http://localhost:5000",
		"https://codefolio-phi.vercel.app",
		"http://tauri.localhost",
	],
	credentials: true,
}

const limiter = rateLimit({
	windowMs: 5 * 60 * 1000, // 5 minutes
	limit: 300, // Limit each IP to 300 requests per `window` (here, per 5 minutes).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	ipv6Subnet: 64, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
})
app.use(cors(corsOptions))
app.use(limiter)

mongoose.connect(process.env.MONGODB_URI)

const db = mongoose.connection
db.on("error", console.error.bind(console, "MongoDB connection error:"))
db.once("open", () =>
	console.log(`MongoDB connected to ${process.env.MONGODB_URI} successfully`)
)

app.use(cookieParser())
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb", extended: true }))

app.use((req, _res, next) => {
	Object.defineProperty(req, 'query', {
		...Object.getOwnPropertyDescriptor(req, 'query'),
		value: req.query,
		writable: true,
	})

	next()
})
app.use(ExpressMongoSanitize())
app.use((req, _res, next) => {
	Object.defineProperty(req, 'query', {
		...Object.getOwnPropertyDescriptor(req, 'query'),
		value: req.query,
		writable: false,
	})

	next()
})

app.use("/api/users", userRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/upload", uploadRoutes)
app.use("/api/notifications", notificationRoutes)

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
})

export default app
