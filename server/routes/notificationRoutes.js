import express from "express"
import Notification from "../models/Notification.js"
import authenticateToken from "../middleware/authenticateToken.js"

const router = express.Router()

router.get("/", authenticateToken, async (req, res) => {
	try {
		const notifications = await Notification.find({ recipient: req.user.id })
			.populate("sender", "username firstName lastName avatar")
			.populate({
				path: "relatedPost",
				select: "title content author",
				populate: {
					path: "author",
					select: "username",
				},
			})
			.sort({ createdAt: -1 })
			.limit(50)

		res.json(notifications)
	} catch (error) {
		console.error("Error fetching notifications:", error)
		res.status(500).json({ message: "Error fetching notifications", error })
	}
})

router.get("/unread-count", authenticateToken, async (req, res) => {
	try {
		const count = await Notification.countDocuments({
			recipient: req.user.id,
			isRead: false,
		})

		res.json({ unreadCount: count })
	} catch (error) {
		console.error("Error fetching unread count:", error)
		res.status(500).json({ message: "Error fetching unread count", error })
	}
})

// Mark a notification as read
router.patch("/:id/read", authenticateToken, async (req, res) => {
	try {
		const notification = await Notification.findOne({
			_id: req.params.id,
			recipient: req.user.id,
		})

		if (!notification) {
			return res.status(404).json({ message: "Notification not found" })
		}

		notification.isRead = true
		await notification.save()

		res.json({ message: "Notification marked as read", notification })
	} catch (error) {
		console.error("Error marking notification as read:", error)
		res
			.status(500)
			.json({ message: "Error marking notification as read", error })
	}
})

// Mark all notifications as read
router.patch("/read-all", authenticateToken, async (req, res) => {
	try {
		await Notification.updateMany(
			{ recipient: req.user.id, isRead: false },
			{ isRead: true }
		)

		res.json({ message: "All notifications marked as read" })
	} catch (error) {
		console.error("Error marking all notifications as read:", error)
		res
			.status(500)
			.json({ message: "Error marking all notifications as read", error })
	}
})

// Delete a notification
router.delete("/:id", authenticateToken, async (req, res) => {
	try {
		const notification = await Notification.findOneAndDelete({
			_id: req.params.id,
			recipient: req.user.id,
		})

		if (!notification) {
			return res.status(404).json({ message: "Notification not found" })
		}

		res.json({ message: "Notification deleted successfully" })
	} catch (error) {
		console.error("Error deleting notification:", error)
		res.status(500).json({ message: "Error deleting notification", error })
	}
})

// Delete all notifications for the authenticated user
router.delete("/", authenticateToken, async (req, res) => {
	try {
		await Notification.deleteMany({ recipient: req.user.id })
		res.json({ message: "All notifications deleted successfully" })
	} catch (error) {
		console.error("Error deleting all notifications:", error)
		res.status(500).json({ message: "Error deleting all notifications", error })
	}
})

export default router
