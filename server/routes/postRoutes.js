import express from "express"
import jwt from "jsonwebtoken"
import fs from "fs"
import authenticateToken from "../middleware/authenticateToken.js"
import adminAuth from "../middleware/adminAuth.js"
import Post from "../models/Post.js"
import User from "../models/User.js"
import { extractMentions, notifyMentionedUsers } from "../utils/mentions.js"

const publicKey = fs.readFileSync("./public.key")
const router = express.Router()

// 🔹 Create a post
router.post("/", authenticateToken, async (req, res) => {
	try {
		const post = new Post({ ...req.body, author: req.user.id })
		await post.save()
		res.status(201).json({ message: "Post created successfully", post })
	} catch (error) {
		console.error("Error creating post:", error)
		res.status(400).json({ message: "Error creating post", error })
	}
})

// 🔹 Get all posts
router.get("/", async (req, res) => {
	try {
		const posts = await Post.find().populate("author", "username avatar")

		// Check if user is authenticated and get their vote states
		let user = null
		if (req.headers.authorization) {
			try {
				const token = req.headers.authorization.split(" ")[1]
				const decoded = jwt.verify(token, publicKey, { algorithms: ["RS256"] })
				user = await User.findById(decoded.id)
			} catch (tokenError) {
				// Invalid token, continue without user vote states
			}
		}

		// Add vote states to posts if user is authenticated
		const postsWithVoteStates = posts.map(post => {
			const postData = post.toJSON()
			if (user) {
				const userVote = user.votedPosts.find(
					vote => vote.postId.toString() === post._id.toString()
				)
				postData.liked = userVote ? userVote.upvoted : null
			} else {
				postData.liked = null
			}
			return postData
		})

		res.json(postsWithVoteStates)
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
		const posts = await Post.find({ author: user.id }).populate(
			"author",
			"username avatar"
		)
		if (!posts) return res.status(404).json({ message: "Posts not found" })

		// Check if requesting user is authenticated and get their vote states
		let requestingUser = null
		if (req.headers.authorization) {
			try {
				const token = req.headers.authorization.split(" ")[1]
				const decoded = jwt.verify(token, publicKey, { algorithms: ["RS256"] })
				requestingUser = await User.findById(decoded.id)
			} catch (tokenError) {
				// Invalid token, continue without user vote states
			}
		}

		// Add vote states to posts if user is authenticated
		const postsWithVoteStates = posts.map(post => {
			const postData = post.toJSON()
			if (requestingUser) {
				const userVote = requestingUser.votedPosts.find(
					vote => vote.postId.toString() === post._id.toString()
				)
				postData.liked = userVote ? userVote.upvoted : null
			} else {
				postData.liked = null
			}
			return postData
		})

		res.json(postsWithVoteStates)
	} catch (error) {
		console.error("Error fetching posts:", error)
		res.status(500).json({ message: "Error fetching posts", error })
	}
})
// 🔹 Get a specific post
router.get("/:username/:id", async (req, res) => {
	try {
		console.log("OK")
		const post = await Post.findById(req.params.id)
			.populate("author", "username avatar firstName lastName")
			.populate("comments.user", "username avatar firstName lastName")
			.populate("comments.replies.user", "username avatar firstName lastName")
		if (!post) return res.status(404).json({ message: "Not found" })

		// Increment views by 1
		post.views += 1
		await post.save()

		// Check if user is authenticated and get their vote state		let liked = null
		if (req.headers.authorization) {
			const token = req.headers.authorization.split(" ")[1]
			const decoded = jwt.verify(token, publicKey, { algorithms: ["RS256"] })
			const user = await User.findById(decoded.id)
			if (user) {
				console.log("📊 User votedPosts:", user.votedPosts)
				const userVote = user.votedPosts.find(
					vote => vote.postId.toString() === req.params.id
				)
				liked = userVote ? userVote.upvoted : null
			}
		} else {
			console.log("No authorization header found")
		}

		const postData = post.toJSON()
		postData.liked = liked
		res.json(postData)
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
		if (post.author.toString() !== req.user.id) {
			return res
				.status(403)
				.json({ message: "Not authorized to update this post" })
		}

		Object.assign(post, req.body)
		await post.save()

		res.json({ message: "Post updated successfully", post })
	} catch (error) {
		res.status(400).json({ message: "Error updating post", error })
	}
})

// 🔹 Delete a post
router.delete("/:id", authenticateToken, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id)
		if (!post) return res.status(404).json({ message: "Post not found" })
		if (post.author.toString() !== req.user.id) {
			return res
				.status(403)
				.json({ message: "Not authorized to delete this post" })
		}

		await post.deleteOne
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
		// Populate the new comment with user data before sending response
		await post.populate("comments.user", "username avatar firstName lastName")

		// Handle mentions if any exist
		if (mentions.length > 0) {
			const currentUser = await User.findById(req.user.id)
			await notifyMentionedUsers(mentions, post._id, null, currentUser)
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

// Admin routes for managing any post
router.put("/admin/:id", adminAuth, async (req, res) => {
	try {
		const postId = req.params.id
		const updatedPost = req.body

		const post = await Post.findByIdAndUpdate(postId, updatedPost, {
			new: true,
			runValidators: true,
		}).populate("author", "username")

		if (!post) {
			return res.status(404).json({ message: "Post not found" })
		}

		res.json({ message: "Post updated successfully", post })
	} catch (error) {
		console.error("Error updating post:", error)
		res
			.status(400)
			.json({ message: "Error updating post", error: error.message })
	}
})

router.delete("/admin/:id", adminAuth, async (req, res) => {
	try {
		const postId = req.params.id

		if (!postId) {
			return res.status(400).json({ message: "Post ID is required" })
		}

		const post = await Post.findByIdAndDelete(postId)

		if (!post) {
			return res.status(404).json({ message: "Post not found" })
		}

		res.json({ message: `Post with ID: ${postId} deleted successfully` })
	} catch (error) {
		console.error("Error deleting post:", error)
		res
			.status(500)
			.json({ message: "Error deleting post", error: error.message })
	}
})

export default router
