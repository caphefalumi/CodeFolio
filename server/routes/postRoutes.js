import express from "express"
import fs from "fs"
import jwt from "jsonwebtoken"
import authenticateToken from "../middleware/authenticateToken.js"
import Post from "../models/Post.js"
import User from "../models/User.js"
import { extractMentions, notifyMentionedUsers } from "../utils/mentions.js"
import { isAuthorizedUser } from "../utils/adminCheck.js"
import { NodeHtmlMarkdown } from "node-html-markdown"

const router = express.Router()
const publicKey = fs.readFileSync(process.cwd() + "/public.key", "utf8")

// 🔹 Create a post
router.post("/", authenticateToken, async (req, res) => {
	try {
		let content = req.body.content
		// Always store as HTML: if not imported from GitHub and content is NOT already HTML, convert Markdown to HTML
		if (!req.body.importedFromGithub && content && !/<[^>]+>/.test(content)) {
			// Convert Markdown to HTML using marked
			const { marked } = await import("marked")
			content = marked.parse(content)
		}
		const post = new Post({ ...req.body, content, author: req.user.id })
		await post.save()

		// Get current user for notifications
		const currentUser = await User.findById(req.user.id)

		// Extract mentions from post content
		const mentions = extractMentions(req.body.content)

		// Handle mentions if any exist
		if (mentions.length > 0) {
			await notifyMentionedUsers(mentions, post._id, null, currentUser)
		}

		// Notify followers about new post
		if (currentUser.followers && currentUser.followers.length > 0) {
			const Notification = (await import("../models/Notification.js")).default

			const followerNotifications = currentUser.followers.map(followerId => ({
				recipient: followerId,
				sender: req.user.id,
				type: "follow",
				message: `${currentUser.firstName} ${currentUser.lastName} posted a new project: ${post.title}`,
				relatedPost: post._id,
			}))

			await Notification.insertMany(followerNotifications)
		}

		res.status(201).json({ message: "Post created successfully", post })
	} catch (error) {
		console.error("Error creating post:", error)
		res.status(400).json({ message: "Error creating post", error })
	}
})

// 🔹 Get all posts
router.get("/", async (req, res) => {
	try {
		const posts = await Post.find()
			.populate("author", "username avatar")
			.sort({ createdAt: -1 })

		res.json(posts)
	} catch (error) {
		console.error("Error fetching posts:", error)
		res.status(500).json({ message: "Error fetching posts", error })
	}
})

// 🔹 Get all posts for a user
router.get("/:username", async (req, res) => {
	try {
		const user = await User.findOne({ username: req.params.username })
		if (!user) return res.status(404).json({ message: "User not found" })

		const posts = await Post.find({ author: user.id })
			.populate("author", "username avatar")
			.sort({ createdAt: -1 })
		if (!posts) return res.status(404).json({ message: "Posts not found" })

		res.json(posts)
	} catch (error) {
		console.error("Error fetching posts:", error)
		res.status(500).json({ message: "Error fetching posts", error })
	}
})
// 🔹 Get a specific post
router.get("/:username/:id", async (req, res) => {
	try {
		await Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } })

		const post = await Post.findById(req.params.id)
			.populate("author", "username avatar firstName lastName")
			.populate("comments.user", "username avatar firstName lastName")
			.populate("comments.replies.user", "username avatar firstName lastName")

		if (!post) return res.status(404).json({ message: "Not found" })

		let liked = null
		if (req.headers.authorization) {
			try {
				const token = req.headers.authorization.split(" ")[1]
				const decoded = jwt.verify(token, publicKey, { algorithms: ["RS256"] })
				const user = await User.findById(decoded.id)
				if (user) {
					const currentVote = user.votedPosts.find(
						vote => vote.postId.toString() === req.params.id
					)
					liked = currentVote ? currentVote.upvoted : null
				}
			} catch (authError) {
				console.log("Invalid token in project detail route")
			}
		}

		const postResponse = post.toJSON()
		postResponse.liked = liked

		res.json(postResponse)
	} catch (err) {
		console.error("Error fetching post:", err)
		res.status(500).json({ message: "Error", err })
	}
})

// 🔹 Update a post
router.patch("/:id", authenticateToken, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id)
		if (!post) return res.status(404).json({ message: "Post not found" })

		// Check if current user is authorized (is the author or is admin)
		const isAuthorized = await isAuthorizedUser(
			req.user.id,
			post.author.toString()
		)

		if (!isAuthorized) {
			return res
				.status(403)
				.json({ message: "Not authorized to update this post" })
		}

		let content = req.body.content
		// Always store as HTML: if not imported from GitHub and content is NOT already HTML, convert Markdown to HTML
		if (!req.body.importedFromGithub && content && !/<[^>]+>/.test(content)) {
			const { marked } = await import("marked")
			content = marked.parse(content)
		}
		Object.assign(post, { ...req.body, content })
		await post.save()

		res.json({ message: "Post updated successfully", post })
	} catch (error) {
		console.error("Error updating post:", error)
		res.status(400).json({ message: "Error updating post", error })
	}
})

// 🔹 Delete a post
router.delete("/:id", authenticateToken, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id)
		if (!post) {
			return res.status(404).json({ message: "Post not found" })
		}

		// Check if current user is authorized (is the author or is admin)
		const isAuthorized = await isAuthorizedUser(
			req.user.id,
			post.author.toString()
		)

		if (!isAuthorized) {
			console.error("Unauthorized delete attempt:", {
				userId: req.user.id,
				postId: post._id,
			})
			return res
				.status(403)
				.json({ message: "Not authorized to delete this post" })
		}

		await Post.findByIdAndDelete(req.params.id)
		res.json({ message: "Post deleted successfully" })
	} catch (error) {
		console.error("Error deleting post:", error)
		res.status(500).json({ message: "Error deleting post", error })
	}
})

// 🔹 Add a comment
router.post("/:id/comments", authenticateToken, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id)
		if (!post) return res.status(404).json({ message: "Post not found" })
		const commentContent = req.body.content

		// Extract mentions from comment content
		const mentions = extractMentions(commentContent)

		// Add the comment
		post.comments.push({ user: req.user.id, content: commentContent })
		await post.save()

		// Get the newly created comment ID
		const newComment = post.comments[post.comments.length - 1]

		// Populate the new comment with user data before sending response
		await post.populate("comments.user", "username avatar firstName lastName")

		// Handle mentions if any exist
		if (mentions.length > 0) {
			const currentUser = await User.findById(req.user.id)
			await notifyMentionedUsers(
				mentions,
				post._id,
				newComment._id,
				currentUser
			)
		}

		res.status(201).json({
			message: "Comment added successfully",
			comments: post.comments,
		})
	} catch (error) {
		console.error("Error adding comment:", error)
		res.status(400).json({ message: "Error adding comment", error })
	}
})

// 🔹 Add a reply to a comment
router.post(
	"/:id/comments/:commentId/replies",
	authenticateToken,
	async (req, res) => {
		try {
			const post = await Post.findById(req.params.id)
			if (!post) return res.status(404).json({ message: "Post not found" })

			const comment = post.comments.id(req.params.commentId)
			if (!comment)
				return res.status(404).json({ message: "Comment not found" })

			const replyContent = req.body.content // Extract mentions from reply content
			const mentions = extractMentions(replyContent)

			comment.replies.push({ user: req.user.id, content: replyContent })
			await post.save()

			// Re-populate the entire post with fresh user data to ensure consistency
			await post.populate("comments.user", "username avatar firstName lastName")
			await post.populate(
				"comments.replies.user",
				"username avatar firstName lastName"
			)

			// Handle mentions if any exist
			if (mentions.length > 0) {
				const currentUser = await User.findById(req.user.id)
				await notifyMentionedUsers(mentions, post._id, comment._id, currentUser)
			}

			res.status(201).json({
				message: "Reply added successfully",
				comments: post.comments,
			})
		} catch (error) {
			console.error("Error adding reply:", error)
			res.status(400).json({ message: "Error adding reply", error })
		}
	}
)

router.post("/:id/upvote", authenticateToken, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id)
		if (!post) return res.status(404).json({ message: "Post not found" })

		const userId = req.user.id
		const user = await User.findById(userId)

		// Find existing vote for this post
		const existingVote = user.votedPosts.find(
			vote => vote.postId.toString() === req.params.id
		)

		if (existingVote) {
			if (existingVote.upvoted === true) {
				// Already upvoted, remove the vote (toggle off)
				user.votedPosts = user.votedPosts.filter(
					vote => vote.postId.toString() !== req.params.id
				)
				post.upvotes = Math.max(0, post.upvotes - 1)
			} else if (existingVote.upvoted === false) {
				// Was downvoted, change to upvote
				existingVote.upvoted = true
				post.downvotes = Math.max(0, post.downvotes - 1)
				post.upvotes += 1
			} else {
				// Was null (no vote), change to upvote
				existingVote.upvoted = true
				post.upvotes += 1
			}
		} else {
			// No existing vote, add new upvote
			user.votedPosts.push({
				postId: req.params.id,
				upvoted: true,
			})
			post.upvotes += 1
		}

		await user.save()
		await post.save()

		// Determine current vote state for response
		const currentVote = user.votedPosts.find(
			vote => vote.postId.toString() === req.params.id
		)
		const liked = currentVote ? currentVote.upvoted : null

		res.json({
			upvotes: post.upvotes,
			downvotes: post.downvotes,
			liked,
		})
	} catch (error) {
		console.error("Error upvoting post:", error)
		res.status(400).json({ message: "Error upvoting post", error })
	}
})

// 🔹 Downvote a post (Reddit/StackOverflow style)
router.post("/:id/downvote", authenticateToken, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id)
		if (!post) return res.status(404).json({ message: "Post not found" })

		const userId = req.user.id
		const user = await User.findById(userId)

		// Find existing vote for this post
		const existingVote = user.votedPosts.find(
			vote => vote.postId.toString() === req.params.id
		)

		if (existingVote) {
			if (existingVote.upvoted === false) {
				// Already downvoted, remove the vote (toggle off)
				user.votedPosts = user.votedPosts.filter(
					vote => vote.postId.toString() !== req.params.id
				)
				post.downvotes = Math.max(0, post.downvotes - 1)
			} else if (existingVote.upvoted === true) {
				// Was upvoted, change to downvote
				existingVote.upvoted = false
				post.upvotes = Math.max(0, post.upvotes - 1)
				post.downvotes += 1
			} else {
				// Was null (no vote), change to downvote
				existingVote.upvoted = false
				post.downvotes += 1
			}
		} else {
			// No existing vote, add new downvote
			user.votedPosts.push({
				postId: req.params.id,
				upvoted: false,
			})
			post.downvotes += 1
		}

		await user.save()
		await post.save()

		// Determine current vote state for response
		const currentVote = user.votedPosts.find(
			vote => vote.postId.toString() === req.params.id
		)
		const liked = currentVote ? currentVote.upvoted : null

		res.json({
			upvotes: post.upvotes,
			downvotes: post.downvotes,
			liked,
		})
	} catch (error) {
		console.error("Error downvoting post:", error)
		res.status(400).json({ message: "Error downvoting post", error })
	}
})

// 🔹 Edit a comment
router.patch("/:id/comments/:commentId", authenticateToken, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id)
		if (!post) return res.status(404).json({ message: "Post not found" })

		const comment = post.comments.id(req.params.commentId)
		if (!comment) return res.status(404).json({ message: "Comment not found" })

		// Check if current user is authorized (is the comment author or is admin)
		const isAuthorized = await isAuthorizedUser(
			req.user.id,
			comment.user.toString()
		)

		if (!isAuthorized) {
			return res
				.status(403)
				.json({ message: "Not authorized to edit this comment" })
		}

		const newContent = req.body.content
		if (!newContent || !newContent.trim()) {
			return res
				.status(400)
				.json({ message: "Comment content cannot be empty" })
		}

		// Update the comment content and mark as edited
		comment.content = newContent.trim()
		comment.edited = true
		comment.editedAt = new Date()
		await post.save()

		// Re-populate and return updated comments
		await post.populate("comments.user", "username avatar firstName lastName")
		await post.populate(
			"comments.replies.user",
			"username avatar firstName lastName"
		)

		res.json({
			message: "Comment edited successfully",
			comments: post.comments,
		})
	} catch (error) {
		console.error("Error editing comment:", error)
		res.status(500).json({ message: "Error editing comment", error })
	}
})

// 🔹 Edit a reply
router.patch(
	"/:id/comments/:commentId/replies/:replyId",
	authenticateToken,
	async (req, res) => {
		try {
			const post = await Post.findById(req.params.id)
			if (!post) return res.status(404).json({ message: "Post not found" })

			const comment = post.comments.id(req.params.commentId)
			if (!comment)
				return res.status(404).json({ message: "Comment not found" })

			const reply = comment.replies.id(req.params.replyId)
			if (!reply) return res.status(404).json({ message: "Reply not found" })

			// Check if current user is authorized (is the reply author or is admin)
			const isAuthorized = await isAuthorizedUser(
				req.user.id,
				reply.user.toString()
			)

			if (!isAuthorized) {
				return res
					.status(403)
					.json({ message: "Not authorized to edit this reply" })
			}

			const newContent = req.body.content
			if (!newContent || !newContent.trim()) {
				return res
					.status(400)
					.json({ message: "Reply content cannot be empty" })
			}

			// Update the reply content and mark as edited
			reply.content = newContent.trim()
			reply.edited = true
			reply.editedAt = new Date()
			await post.save()

			// Re-populate and return updated comments
			await post.populate("comments.user", "username avatar firstName lastName")
			await post.populate(
				"comments.replies.user",
				"username avatar firstName lastName"
			)

			res.json({
				message: "Reply edited successfully",
				comments: post.comments,
			})
		} catch (error) {
			console.error("Error editing reply:", error)
			res.status(500).json({ message: "Error editing reply", error })
		}
	}
)

// 🔹 Delete a comment
router.delete(
	"/:id/comments/:commentId",
	authenticateToken,
	async (req, res) => {
		try {
			const post = await Post.findById(req.params.id)
			if (!post) return res.status(404).json({ message: "Post not found" })

			const comment = post.comments.id(req.params.commentId)
			if (!comment)
				return res.status(404).json({ message: "Comment not found" })

			// Check if current user is authorized (is the comment author or is admin)
			const isAuthorized = await isAuthorizedUser(
				req.user.id,
				comment.user.toString()
			)

			if (!isAuthorized) {
				return res
					.status(403)
					.json({ message: "Not authorized to delete this comment" })
			}

			// Clean up notifications related to this comment
			await post.cleanupCommentNotifications(comment._id)

			// Remove the comment
			post.comments.pull(req.params.commentId)
			await post.save()

			// Re-populate and return updated comments
			await post.populate("comments.user", "username avatar firstName lastName")
			await post.populate(
				"comments.replies.user",
				"username avatar firstName lastName"
			)

			res.json({
				message: "Comment deleted successfully",
				comments: post.comments,
			})
		} catch (error) {
			console.error("Error deleting comment:", error)
			res.status(500).json({ message: "Error deleting comment", error })
		}
	}
)

// 🔹 Delete a reply
router.delete(
	"/:id/comments/:commentId/replies/:replyId",
	authenticateToken,
	async (req, res) => {
		try {
			const post = await Post.findById(req.params.id)
			if (!post) return res.status(404).json({ message: "Post not found" })

			const comment = post.comments.id(req.params.commentId)
			if (!comment)
				return res.status(404).json({ message: "Comment not found" })

			const reply = comment.replies.id(req.params.replyId)
			if (!reply) return res.status(404).json({ message: "Reply not found" })

			// Check if current user is authorized (is the reply author or is admin)
			const isAuthorized = await isAuthorizedUser(
				req.user.id,
				reply.user.toString()
			)

			if (!isAuthorized) {
				return res
					.status(403)
					.json({ message: "Not authorized to delete this reply" })
			}

			// Remove the reply
			comment.replies.pull(req.params.replyId)
			await post.save()

			// Re-populate and return updated comments
			await post.populate("comments.user", "username avatar firstName lastName")
			await post.populate(
				"comments.replies.user",
				"username avatar firstName lastName"
			)

			res.json({
				message: "Reply deleted successfully",
				comments: post.comments,
			})
		} catch (error) {
			console.error("Error deleting reply:", error)
			res.status(500).json({ message: "Error deleting reply", error })
		}
	}
)

export default router
