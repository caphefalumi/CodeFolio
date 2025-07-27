import jwt from "jsonwebtoken"
import fs from "fs"
import "dotenv/config"

const publicKey = fs.readFileSync(process.cwd() + "/public.key", "utf8")

function authenticateAccessToken(req, res, next) {
	let accessToken = null
	const authHeader = req.headers["authorization"]

	if (authHeader && authHeader.startsWith("Bearer ")) {
		accessToken = authHeader.split(" ")[1]
	}

	if (!accessToken && req.cookies && req.cookies.accessToken) {
		accessToken = req.cookies.accessToken
	}

	if (!accessToken) {
		return res.status(401).json({
			message:
				"Access denied. No access token provided in Authorization header or cookies.",
		})
	}
	jwt.verify(
		accessToken,
		publicKey,
		{ algorithms: ["RS256"] },
		(err, decoded) => {
			if (err) {
				console.error("Access token verification error:", err.message)
				return res.status(403).json({
					message: "Not authorized",
				})
			}
			req.user = decoded
			next()
		}
	)
}

export default authenticateAccessToken
