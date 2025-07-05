import mongoose from "mongoose"
import User from "./User.js"
const replySchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	content: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
})

const commentSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	content: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	replies: [replySchema],
})

const postSchema = new mongoose.Schema({
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	title: {
		type: String,
		required: true,
	},
	coverImage: {
		type: String,
	},
	description: {
		type: String,
	},
	content: {
		type: String,
		required: true,
	},
	tags: {
		type: [String],
		default: [],
	},
	githubUrl: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		default: "Web Development",
	},
	upvotes: {
		type: Number,
		default: 0,
	},
	downvotes: {
		type: Number,
		default: 0,
	},
	views: {
		type: Number,
		default: 0,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
	comments: [commentSchema],
})

postSchema.statics.findByAuthor = async function (username) {
	const user = await User.findOne({ username: new RegExp(username, "i") })
	if (!user) return []
	return this.find({ author: user._id }).populate("author", "username avatar")
}

postSchema.virtual("getAuthor").get(async function () {
	return User.findById(this.author).select("username")
})
postSchema.virtual("getFullPath").get(function () {
	if (!this.author || !this.author.username) return null
	return `${this.author.username}/${this._id}`
})

postSchema.pre("save", function (next) {
	this.updatedAt = Date.now()
	next()
})
postSchema.pre("findOneAndUpdate", function (next) {
	this.set({ updatedAt: Date.now() })
	next()
})

// Cascade deletion when post is deleted
postSchema.pre("findOneAndDelete", async function (next) {
	try {
		const postId = this.getQuery()._id

		// Import models here to avoid circular dependency
		const Notification = (await import("./Notification.js")).default
		const User = (await import("./User.js")).default

		// Delete all notifications related to this post
		await Notification.deleteMany({ relatedPost: postId })

		// Remove this post from users' votedPosts arrays
		await User.updateMany(
			{ "votedPosts.postId": postId },
			{ $pull: { votedPosts: { postId: postId } } }
		)

		next()
	} catch (error) {
		next(error)
	}
})

// Method to clean up notifications when comments are deleted
postSchema.methods.cleanupCommentNotifications = async function (commentId) {
	try {
		const Notification = (await import("./Notification.js")).default
		await Notification.deleteMany({ relatedComment: commentId })
	} catch (error) {
		console.error("Error cleaning up comment notifications:", error)
	}
}

postSchema.set("toJSON", { virtuals: true })

const Post = mongoose.model("Post", postSchema)
export default Post
