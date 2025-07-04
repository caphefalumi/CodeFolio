// Utility function to extract mentions from text
export function extractMentions(text) {
	if (!text) return []

	const mentionRegex = /@([a-zA-Z0-9_.]+)/g
	const mentions = []
	let match

	while ((match = mentionRegex.exec(text)) !== null) {
		const username = match[1]
		if (!mentions.includes(username)) {
			mentions.push(username)
		}
	}

	return mentions
}

// Function to notify mentioned users (can be extended for email/push notifications)
export async function notifyMentionedUsers(
	mentions,
	postId,
	commentId,
	mentionerUser
) {
	// Import here to avoid circular dependency
	const User = (await import("../models/User.js")).default
	const Notification = (await import("../models/Notification.js")).default
	const Post = (await import("../models/Post.js")).default

	try {
		// Get the post details for the notification message
		const post = await Post.findById(postId).populate("author", "username")
		if (!post) {
			return mentions
		}

		// Find users by username from mentions
		const mentionedUsers = await User.find({
			username: { $in: mentions },
		}).select("_id username")

		if (mentionedUsers.length === 0) {
			return mentions
		}

		// Create notifications for each mentioned user
		const notifications = mentionedUsers
			.map(user => {
				// Don't notify if user mentions themselves
				if (user._id.toString() === mentionerUser._id.toString()) {
					return null
				}

				const isComment = commentId !== null
				const message = isComment
					? `@${mentionerUser.username} mentioned you in a comment on "${post.title}"`
					: `@${mentionerUser.username} mentioned you in the post "${post.title}"`

				return {
					recipient: user._id,
					sender: mentionerUser._id,
					type: "mention",
					message: message,
					relatedPost: postId,
					relatedComment: commentId,
				}
			})
			.filter(notification => notification !== null)

		if (notifications.length > 0) {
			await Notification.insertMany(notifications)
		}

		return mentions
	} catch (error) {
		console.error("Error creating mention notifications:", error)
		return mentions
	}
}
