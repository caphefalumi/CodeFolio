import express from "express"
import authenticateToken from "../middleware/authenticateToken.js"
import "dotenv/config"
import User from "../models/User.js"
import { isAuthorizedUser, isAdmin } from "../utils/adminCheck.js"
import bcrypt from "bcrypt"
import getRandomCat from "random-cat-img"
const router = express.Router()

router.get("/", async (req, res) => {
	try {
		const users = await User.find()
		res.json(users)
	} catch (error) {
		res.status(500).json({ message: "Error fetching users", error })
	}
})

// Admin-only user creation route
router.post("/", authenticateToken, async (req, res) => {
	try {
		// Check if current user is admin
		const userIsAdmin = await isAdmin(req.user.id)

		if (!userIsAdmin) {
			return res
				.status(403)
				.json({ message: "Admin access required to create users" })
		}

		const { email, username, firstName, lastName, password } = req.body

		// Validation
		if (!username || !email || !password) {
			return res
				.status(400)
				.json({ message: "Username, email, and password are required" })
		}

		// Check for existing users
		if (await User.findOne({ username })) {
			return res.status(400).json({ message: "Username already exists" })
		}
		if (await User.findOne({ email })) {
			return res.status(400).json({ message: "Email already exists" })
		}

		// Create user
		const saltRounds = 10
		const hashedPassword = await bcrypt.hash(password, saltRounds)
		const user = new User({
			email,
			username,
			firstName,
			lastName,
			password: hashedPassword,
			avatar: await getRandomCat().then(data => data.message),
		})

		await user.save()

		res.status(201).json({
			message: "User created successfully",
			user: {
				_id: user._id,
				email: user.email,
				username: user.username,
				firstName: user.firstName,
				lastName: user.lastName,
				avatar: user.avatar,
			},
		})
	} catch (error) {
		console.error("Error creating user:", error)
		res.status(500).json({ message: "Error creating user", error })
	}
})

// Search users for mentions
router.get("/search", async (req, res) => {
	try {
		const { q, limit = 10 } = req.query
		if (!q || q.trim().length < 1) {
			return res.json([])
		}

		const users = await User.find({
			$or: [
				{ username: { $regex: q, $options: "i" } },
				{ firstName: { $regex: q, $options: "i" } },
				{ lastName: { $regex: q, $options: "i" } },
			],
		})
			.select("username firstName lastName avatar")
			.limit(parseInt(limit))

		res.json(users)
	} catch (error) {
		console.error("Error searching users:", error)
		res.status(500).json({ message: "Error searching users", error })
	}
})
router.get("/me", authenticateToken, async (req, res) => {
	try {
		const user = await User.findById(req.user.id)
		if (!user) {
			return res.status(404).json({ message: "User not found" })
		}
		res.json(user)
	} catch (error) {
		res.status(500).json({ message: "Error fetching current user", error })
	}
})

router.get("/:username", async (req, res) => {
	try {
		const user = await User.findOne({ username: req.params.username })
		if (!user) return res.status(404).json({ message: "User not found" })

		const userData = {
			_id: user._id,
			username: user.username,
			firstName: user.firstName,
			lastName: user.lastName,
			bio: user.bio,
			avatar: user.avatar,
		}
		res.status(200).json(userData)
	} catch (error) {
		console.error("Error fetching user:", error)
		res.status(500).json({ message: "Error fetching user", error })
	}
})

router.patch("/", authenticateToken, async (req, res) => {
	const updatedUser = req.body
	try {
		await User.findByIdAndUpdate(req.user.id, updatedUser, { new: true })
		res.json({ message: "User updated successfully", user: updatedUser })
	} catch (error) {
		console.error("Error updating user:", error)
		res.status(400).json({ message: "Error updating user", error })
	}
})

// Admin-enabled user update route
router.patch("/:id", authenticateToken, async (req, res) => {
	const targetUserId = req.params.id
	const currentUserId = req.user.id
	const updatedUser = req.body

	try {
		// Check if current user is authorized (is the target user or is admin)
		const isAuthorized = await isAuthorizedUser(currentUserId, targetUserId)

		if (!isAuthorized) {
			return res
				.status(403)
				.json({ message: "Not authorized to update this user" })
		}

		const user = await User.findByIdAndUpdate(targetUserId, updatedUser, {
			new: true,
		})

		if (!user) {
			return res.status(404).json({ message: "User not found" })
		}

		res.json({ message: "User updated successfully", user })
	} catch (error) {
		console.error("Error updating user:", error)
		res.status(400).json({ message: "Error updating user", error })
	}
})

router.delete("/:id", authenticateToken, async (req, res) => {
	const targetUserId = req.params.id
	const currentUserId = req.user.id

	if (!targetUserId) {
		return res.status(400).json({ message: "User ID is required" })
	}

	try {
		// Check if current user is authorized (is the target user or is admin)
		const isAuthorized = await isAuthorizedUser(currentUserId, targetUserId)

		if (!isAuthorized) {
			return res
				.status(403)
				.json({ message: "Not authorized to delete this user" })
		}

		const deletedUser = await User.findByIdAndDelete(targetUserId)

		if (!deletedUser) {
			return res.status(404).json({ message: "User not found" })
		}

		res.json({ message: `User with ID: ${targetUserId} deleted successfully` })
	} catch (error) {
		console.error("Error deleting user:", error)
		res.status(500).json({ message: "Error deleting user", error })
	}
})

export default router
