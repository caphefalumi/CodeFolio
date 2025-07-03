import jwt from "jsonwebtoken"
import fs from "fs"
import User from "../models/User.js"

const publicKey = fs.readFileSync(process.cwd() + "/public.key", "utf8")

const adminAuth = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res.status(401).json({ message: "Access token required" })
		}
		const token = authHeader.split(" ")[1]
		const decoded = jwt.verify(token, publicKey, { algorithms: ["RS256"] })

		const user = await User.findById(decoded.id)
		if (!user) {
			return res.status(401).json({ message: "User not found" })
		}

		// Check if user is admin (currently using email-based check)
		const isAdmin = user.email === "dangduytoan13l@gmail.com"
		if (!isAdmin) {
			return res.status(403).json({ message: "Admin access required" })
		}

		req.user = user
		next()
	} catch (error) {
		console.error("Admin auth error:", error)
		return res.status(401).json({ message: "Invalid access token" })
	}
}

export default adminAuth
