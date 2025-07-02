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
	// For now, just log the mentions
	// In the future, this could send email notifications or push notifications
	console.log(
		`User ${mentionerUser.username} mentioned users:`,
		mentions,
		`in post ${postId}`
	)

	// TODO: Add notification logic here
	// - Create notification records in database
	// - Send email notifications
	// - Send push notifications

	return mentions
}
