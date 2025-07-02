import express from "express"
import crypto from "crypto"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import "dotenv/config"
import User from "../models/User.js"
import axios from "axios"
import getRandomCat from "random-cat-img"
import sendEmail from "../mailer.js"
import authenticateToken from "../middleware/authenticateToken.js"

const router = express.Router()

router.post("/validate", async (req, res) => {
	const [bearer, accessToken] = req.headers.authorization?.split(" ") || []
	if (!accessToken) {
		return res.status(401).json({ message: "Access token is required" })
	}

	try {
		jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, err => {
			if (bearer !== "Bearer") {
				return res.status(403).json({ message: "Invalid access token format" })
			}
			if (err) {
				return res.status(403).json({ message: "Invalid access token" })
			}
			res.json({ valid: true })
		})
	} catch (error) {
		res.status(500).json({ message: "Server error", error })
	}
})

router.post("/token", async (req, res) => {
	console.log("=== /token endpoint called ===")
	console.log("Request headers:", req.headers)
	console.log("All cookies received:", req.cookies)

	const refreshToken = req.cookies.refreshToken
	console.log(
		"Refresh token from cookies:",
		refreshToken ? "Present" : "Not found"
	)

	if (!refreshToken) {
		console.log("No refresh token provided")
		return res.sendStatus(401)
	}

	jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async err => {
		if (err) {
			console.log("JWT verification error:", err.message)
			return res.sendStatus(403)
		}

		const user = await User.findOne({ refreshToken })
		if (!user) {
			console.log("No user found with this refresh token")
			return res.sendStatus(403)
		}

		console.log("User found:", user.username)

		const newRefreshToken = jwt.sign(
			{ id: user._id },
			process.env.REFRESH_TOKEN_SECRET,
			{ expiresIn: "7d" }
		)
		user.refreshToken = newRefreshToken
		await user.save()

		res.cookie("refreshToken", newRefreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: "None",
			origin: process.env.CLIENT_URL,
			maxAge: 7 * 24 * 60 * 60 * 1000,
		})

		const accessToken = jwt.sign(
			{ id: user._id },
			process.env.ACCESS_TOKEN_SECRET,
			{ expiresIn: "1h" }
		)
		console.log("New access token generated successfully")
		res.json({ accessToken })
	})
})

router.post("/register", async (req, res) => {
	const saltRounds = 10
	const hashedPassword = await bcrypt.hash(req.body.password, saltRounds)
	const user = new User({
		email: req.body.email,
		username: req.body.username,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		password: hashedPassword,
		avatar: await getRandomCat().then(data => data.message),
		bio: req.body.bio,
		location: req.body.location,
		githubUrl: req.body.githubUrl,
		avatarUrl: req.body.avatarUrl,
	})

	try {
		if (!req.body.username || !req.body.email || !req.body.password) {
			return res
				.status(400)
				.json({ message: "Username, email, and password are required" })
		} else if (await User.findOne({ username: user.username })) {
			return res.status(400).json({ message: "Username already exists" })
		} else if (await User.findOne({ email: user.email })) {
			return res.status(400).json({ message: "Email already exists" })
		}
	} catch (error) {
		return res.status(500).json({ message: "Error creating user", error })
	}

	await user.save()

	try {
		const mailOptions = {
			from: `CodeFolio <${process.env.GMAIL_USER}>`,
			to: user.email,
			subject: "Welcome to Our Platform!",
			html: `<h1>Hi ${user.firstName},</h1><p>Thank you for registering. We're excited to have you!</p>`,
		}

		await sendEmail(mailOptions)
		res.status(201).json({
			message: "User created successfully. Welcome email sent!",
			user,
		})
	} catch (error) {
		console.error("Email send error:", error)
		res.status(201).json({
			message: "User created, but welcome email failed.",
			user,
		})
	}
})

router.post("/login/jwt", async (req, res) => {
	const { email, password } = req.body
	try {
		const user = await User.findOne({ email })
		if (!user || !user.password) {
			return res.status(401).json({ message: "Invalid email or password" })
		}

		const isMatch = await bcrypt.compare(password, user.password)
		if (!isMatch) {
			return res.status(401).json({ message: "Invalid email or password" })
		}

		const accessToken = jwt.sign(
			{ id: user._id },
			process.env.ACCESS_TOKEN_SECRET,
			{ expiresIn: "1h" }
		)
		const refreshToken = jwt.sign(
			{ id: user._id },
			process.env.REFRESH_TOKEN_SECRET,
			{ expiresIn: "7d" }
		)

		user.refreshToken = refreshToken
		await user.save()

		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: "None",
			origin: process.env.CLIENT_URL,
			maxAge: 7 * 24 * 60 * 60 * 1000,
		})
		res.status(200).json({ accessToken })
	} catch (err) {
		res.status(500).json({ message: "Server error", error: err })
	}
})

router.post("/login/google", async (req, res) => {
	const googleAccessToken = req.body.token

	if (!googleAccessToken) {
		return res.status(400).json({ message: "No access token provided" })
	}

	try {
		const { data: googleUser } = await axios.get(
			"https://www.googleapis.com/oauth2/v2/userinfo",
			{
				headers: { Authorization: `Bearer ${googleAccessToken}` },
			}
		)

		const { id, email, picture, given_name, family_name } = googleUser
		let user = await User.findOne({ email })

		if (!user) {
			let username = email.split("@")[0]
			if (await User.findOne({ username: username })) {
				username += crypto.randomBytes(5).toString("hex")
			}
			user = new User({
				username: username,
				email: email,
				firstName: given_name,
				lastName: family_name,
				password: crypto.randomBytes(128).toString("hex"),
				avatar: picture,
				oAuthProviders: [{ provider: "google", providerId: id }],
			})
		} else {
			const exists = user.oAuthProviders.some(
				p => p.provider === "google" && p.providerId === String(id)
			)
			if (!exists) {
				user.oAuthProviders.push({
					provider: "google",
					providerId: String(id),
				})
			}
		}

		const accessToken = jwt.sign(
			{ id: user._id },
			process.env.ACCESS_TOKEN_SECRET,
			{ expiresIn: "1h" }
		)
		const refreshToken = jwt.sign(
			{ id: user._id },
			process.env.REFRESH_TOKEN_SECRET,
			{ expiresIn: "7d" }
		)

		user.refreshToken = refreshToken
		await user.save()

		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: "None",
			origin: process.env.CLIENT_URL,
			maxAge: 7 * 24 * 60 * 60 * 1000,
		})

		res.json({ accessToken })
	} catch (err) {
		console.error("Google login error:", err)
		res.status(500).json({
			message: "Google login failed",
			error: err.message || err,
		})
	}
})

router.get("/login/github", (req, res) => {
	res.redirect(
		`https://github.com/login/oauth/authorize?scope=user:email&client_id=${process.env.GITHUB_CLIENT_ID}`
	)
})

router.get("/login/github/callback", async (req, res) => {
	const code = req.query.code

	try {
		const resp = await axios.post(
			`https://github.com/login/oauth/access_token`,
			{
				client_id: process.env.GITHUB_CLIENT_ID,
				client_secret: process.env.GITHUB_CLIENT_SECRET,
				code,
			},
			{
				headers: { accept: "application/json" },
			}
		)

		const access_token = resp.data.access_token

		const { data: userProfile } = await axios.get(
			"https://api.github.com/user",
			{
				headers: { Authorization: `Bearer ${access_token}` },
			}
		)

		const { data: emails } = await axios.get(
			"https://api.github.com/user/emails",
			{
				headers: { Authorization: `Bearer ${access_token}` },
			}
		)

		const primaryEmailObj = emails.find(
			email => email.primary && email.verified
		)
		if (!primaryEmailObj) {
			return res
				.status(400)
				.json({ message: "No verified primary email found" })
		}

		const email = primaryEmailObj.email
		const avatar_url = userProfile.avatar_url

		let user = await User.findOne({ email })

		if (!user) {
			let username = email.split("@")[0]
			if (await User.findOne({ username: username })) {
				username += crypto.randomBytes(5).toString("hex")
			}
			user = new User({
				username,
				email,
				firstName: userProfile.name?.split(" ")[0] || "",
				lastName: userProfile.name?.split(" ")[1] || "",
				password: crypto.randomBytes(128).toString("hex"),
				avatar: avatar_url,
				oAuthProviders: [{ provider: "github", providerId: userProfile.id }],
			})
		} else {
			const exists = user.oAuthProviders.some(
				p => p.provider === "github" && p.providerId === String(userProfile.id)
			)
			if (!exists) {
				user.oAuthProviders.push({
					provider: "github",
					providerId: String(userProfile.id),
				})
			}
		}

		const accessToken = jwt.sign(
			{ id: user._id },
			process.env.ACCESS_TOKEN_SECRET,
			{ expiresIn: "1h" }
		)
		const refreshToken = jwt.sign(
			{ id: user._id },
			process.env.REFRESH_TOKEN_SECRET,
			{ expiresIn: "7d" }
		)

		user.refreshToken = refreshToken
		await user.save()

		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: "None",
			origin: process.env.CLIENT_URL,
			maxAge: 7 * 24 * 60 * 60 * 1000,
		})

		res.send(`
			<script>
				window.opener.postMessage(
				${JSON.stringify({ accessToken })},
				"${process.env.CLIENT_URL}"
				);
				window.close();
			</script>
		`)
	} catch (err) {
		res.status(500).json({
			message: "GitHub login failed",
			error: err.message || err,
		})
	}
})

router.post("/logout", async (req, res) => {
	const refreshToken = req.cookies.refreshToken
	if (!refreshToken) {
		return res.sendStatus(204)
	}
	try {
		const user = await User.findOne({ refreshToken })
		if (!user) return res.sendStatus(204)

		user.refreshToken = null
		await user.save()

		res.clearCookie("refreshToken", {
			httpOnly: true,
			secure: true,
			sameSite: "None",
			origin: process.env.CLIENT_URL,
			maxAge: 0,
		})
		res.sendStatus(204)
	} catch (err) {
		res.status(500).json({ message: "Server error", error: err })
	}
})

// Forgot password: send 6-digit code to email
router.post("/forgot-password", authenticateToken, async (req, res) => {
	const user = await User.findOne({ _id: req.user.id })
	console.log("User from token:", user.username)
	if (!user) return res.status(404).json({ message: "User not found" })
	// Generate 6-digit code
	const code = Math.floor(100000 + Math.random() * 900000).toString()
	user.resetCode = code
	user.resetCodeExpires = Date.now() + 15 * 60 * 1000 // 15 min
	await user.save()

	// Send email
	const mailOptions = {
		from: `CodeFolio <${process.env.GMAIL_USER}>`,
		to: user.email,
		subject: "Password Reset Code",
		html: `<h2>Your CodeFolio password reset code:</h2><h1>${code}</h1><p>This code will expire in 15 minutes.</p>`,
	}
	try {
		await sendEmail(mailOptions)
		res.json({ message: "Reset code sent to email" })
	} catch (error) {
		console.error("Email send error:", error)
		res.status(500).json({ message: "Failed to send email", error })
	}
})

// Verify reset code
router.post("/verify-reset-code", authenticateToken, async (req, res) => {
	const { code } = req.body

	const user = await User.findOne({ _id: req.user.id })
	if (!user || !user.resetCode || !user.resetCodeExpires) {
		return res.status(400).json({ message: "Invalid or expired code" })
	}
	if (user.resetCode !== code || Date.now() > user.resetCodeExpires) {
		return res.status(400).json({ message: "Invalid or expired code" })
	}
	res.json({ message: "Code verified" })
})
// Reset password with code
router.post("/reset-password", authenticateToken, async (req, res) => {
	const { code, newPassword } = req.body
	const user = await User.findOne({ _id: req.user.id })
	if (!user || !user.resetCode || !user.resetCodeExpires) {
		return res.status(400).json({ message: "Invalid or expired code" })
	}
	if (user.resetCode !== code || Date.now() > user.resetCodeExpires) {
		return res.status(400).json({ message: "Invalid or expired code" })
	}
	user.password = await bcrypt.hash(newPassword, 10)
	user.resetCode = undefined
	user.resetCodeExpires = undefined
	await user.save()
	res.json({ message: "Password reset successful" })
})

// Change password (user knows current password)
router.post("/change-password", async (req, res) => {
	const { email, currentPassword, newPassword } = req.body
	const user = await User.findOne({ email })
	if (!user || !user.password) {
		return res
			.status(400)
			.json({ message: "User not found or no password set" })
	}
	const isMatch = await bcrypt.compare(currentPassword, user.password)
	if (!isMatch) {
		return res.status(401).json({ message: "Current password is incorrect" })
	}
	user.password = await bcrypt.hash(newPassword, 10)
	await user.save()
	res.json({ message: "Password changed successfully" })
})

export default router
