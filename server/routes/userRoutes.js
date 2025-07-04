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
			followersCount: user.followersCount,
			followingCount: user.followingCount,
			createdAt: user.createdAt,
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

// Follow a user
router.post("/:userId/follow", authenticateToken, async (req, res) => {
	try {
		const currentUserId = req.user.id
		const targetUserId = req.params.userId

		if (currentUserId === targetUserId) {
			return res.status(400).json({ message: "You cannot follow yourself" })
		}

		const currentUser = await User.findById(currentUserId)
		const targetUser = await User.findById(targetUserId)

		if (!targetUser) {
			return res.status(404).json({ message: "User not found" })
		}

		// Check if already following
		if (currentUser.following.includes(targetUserId)) {
			return res.status(400).json({ message: "Already following this user" })
		}

		// Add to following/followers lists
		currentUser.following.push(targetUserId)
		targetUser.followers.push(currentUserId)

		await currentUser.save()
		await targetUser.save()

		// Create notification for the followed user
		const Notification = (await import("../models/Notification.js")).default
		await Notification.create({
			recipient: targetUserId,
			sender: currentUserId,
			type: "follow",
			message: `${currentUser.firstName} ${currentUser.lastName} started following you`,
		})

		res.json({
			message: "Successfully followed user",
			isFollowing: true,
			followersCount: targetUser.followersCount,
			followingCount: currentUser.followingCount,
		})
	} catch (error) {
		console.error("Error following user:", error)
		res.status(500).json({ message: "Error following user", error })
	}
})

// Unfollow a user
router.delete("/:userId/follow", authenticateToken, async (req, res) => {
	try {
		const currentUserId = req.user.id
		const targetUserId = req.params.userId

		if (currentUserId === targetUserId) {
			return res.status(400).json({ message: "You cannot unfollow yourself" })
		}

		const currentUser = await User.findById(currentUserId)
		const targetUser = await User.findById(targetUserId)

		if (!targetUser) {
			return res.status(404).json({ message: "User not found" })
		}

		// Check if not following
		if (!currentUser.following.includes(targetUserId)) {
			return res.status(400).json({ message: "Not following this user" })
		}

		// Remove from following/followers lists
		currentUser.following = currentUser.following.filter(
			id => id.toString() !== targetUserId
		)
		targetUser.followers = targetUser.followers.filter(
			id => id.toString() !== currentUserId
		)

		await currentUser.save()
		await targetUser.save()

		res.json({
			message: "Successfully unfollowed user",
			isFollowing: false,
			followersCount: targetUser.followersCount,
			followingCount: currentUser.followingCount,
		})
	} catch (error) {
		console.error("Error unfollowing user:", error)
		res.status(500).json({ message: "Error unfollowing user", error })
	}
})

// Check if current user is following a specific user
router.get("/:userId/follow-status", authenticateToken, async (req, res) => {
	try {
		const currentUserId = req.user.id
		const targetUserId = req.params.userId

		if (currentUserId === targetUserId) {
			return res.json({ isFollowing: false, canFollow: false })
		}

		const currentUser = await User.findById(currentUserId)
		const isFollowing = currentUser.following.includes(targetUserId)

		res.json({ isFollowing, canFollow: true })
	} catch (error) {
		console.error("Error checking follow status:", error)
		res.status(500).json({ message: "Error checking follow status", error })
	}
})

// Get user's followers
router.get("/:userId/followers", async (req, res) => {
	try {
		const user = await User.findById(req.params.userId).populate(
			"followers",
			"username firstName lastName avatar"
		)

		if (!user) {
			return res.status(404).json({ message: "User not found" })
		}

		res.json({
			followers: user.followers,
			count: user.followers.length,
		})
	} catch (error) {
		console.error("Error fetching followers:", error)
		res.status(500).json({ message: "Error fetching followers", error })
	}
})

// Get user's following
router.get("/:userId/following", async (req, res) => {
	try {
		const user = await User.findById(req.params.userId).populate(
			"following",
			"username firstName lastName avatar"
		)

		if (!user) {
			return res.status(404).json({ message: "User not found" })
		}

		res.json({
			following: user.following,
			count: user.following.length,
		})
	} catch (error) {
		console.error("Error fetching following:", error)
		res.status(500).json({ message: "Error fetching following", error })
	}
})

export default router
