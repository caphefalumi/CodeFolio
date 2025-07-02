import express from "express"
import authenticateToken from "../middleware/authenticateToken.js"
import "dotenv/config"
import User from "../models/User.js"
const router = express.Router()

router.get("/", async (req, res) => {
	try {
		const users = await User.find()
		res.json(users)
	} catch (error) {
		res.status(500).json({ message: "Error fetching users", error })
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
		console.log("User data:", userData)
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

router.delete("/", authenticateToken, async (req, res) => {
	const userId = req.user.id
	if (!userId) {
		return res.status(400).json({ message: "User ID is required" })
	}
	try {
		await User.findByIdAndDelete(userId)
		res.json({ message: `User with ID: ${userId} deleted successfully` })
	} catch (error) {
		res.status(500).json({ message: "Error deleting user", error })
	}
})

export default router
