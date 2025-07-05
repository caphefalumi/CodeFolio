import express from "express"
import mongoose from "mongoose"
import cookieParser from "cookie-parser"
import cors from "cors"
import "dotenv/config"

import userRoutes from "./routes/userRoutes.js"
import postRoutes from "./routes/postRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import uploadRoutes from "./routes/uploadRoutes.js"
import notificationRoutes from "./routes/notificationRoutes.js"

const app = express()
app.use((req, res, next) => {
	const origin = req.get("Origin") || req.get("Referer") || "Unknown origin"
	console.log(`Incoming request from: ${origin}`)
	next()
})

const corsOptions = {
	origin: [
		"https://localhost:3000",
		"https://codefolio-phi.vercel.app",
		"https://bechuotbedangyeu.vercel.app",
		"http://tauri.localhost"
	],
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

app.use(cookieParser())
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb", extended: true }))

app.use("/api/users", userRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/upload", uploadRoutes)
app.use("/api/notifications", notificationRoutes)

app.listen(process.env.SERVER_PORT, () => {
	console.log(`Server is running on port ${process.env.SERVER_PORT}`)
})
export default app
