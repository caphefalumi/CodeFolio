import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema({
	recipient: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	sender: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	type: {
		type: String,
		enum: ["mention", "like", "comment", "follow"],
		required: true,
	},
	message: {
		type: String,
		required: true,
	},
	relatedPost: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Post",
		default: null,
	},
	relatedComment: {
		type: mongoose.Schema.Types.ObjectId,
		default: null,
	},
	isRead: {
		type: Boolean,
		default: false,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
})

// Index for efficient queries
notificationSchema.index({ recipient: 1, createdAt: -1 })
notificationSchema.index({ recipient: 1, isRead: 1 })

const Notification = mongoose.model("Notification", notificationSchema)

export default Notification
