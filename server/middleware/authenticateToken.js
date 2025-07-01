import jwt from "jsonwebtoken"
import "dotenv/config"

function authenticateToken(req, res, next) {
	// Try to get token from Authorization header first (preferred method)
	let token = null
	const authHeader = req.headers["authorization"]
	console.log("Authorization header:", authHeader)

	if (authHeader && authHeader.startsWith("Bearer ")) {
		token = authHeader.split(" ")[1]
	}

	// If no token in header, try to get it from cookies (fallback)
	if (!token && req.cookies && req.cookies.accessToken) {
		token = req.cookies.accessToken
	}

	// If still no token, return unauthorized
	if (!token) {
		return res.status(401).json({
			message:
				"Access denied. No token provided in Authorization header or cookies.",
		})
	}

	// Verify the token
	try {
		jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
			if (err) {
				console.error("Token verification error:", err.message)
				return res.status(403).json({
					message: "Not authorized",
					error:
						err.name === "TokenExpiredError"
							? "Token has expired"
							: "Token is invalid",
				})
			}

			// Add user info to request object
			req.user = decoded
			next()
		})
	} catch (error) {
		console.error("Authentication middleware error:", error)
		return res.status(500).json({
			message: "Authentication server error",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		})
	}
}

export default authenticateToken
