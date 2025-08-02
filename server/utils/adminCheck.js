import User from "../models/User.js"

export const isAdmin = async userId => {
	try {
		const user = await User.findById(userId)
		return user && user.role === "admin"
	} catch (error) {
		console.error("Error checking admin status:", error)
		return false
	}
}
export const isModerator = async userId => {
	try {
		const user = await User.findById(userId)
		return user && user.role === "moderator"
	} catch (error) {
		console.error("Error checking moderator status:", error)
		return false
	}
}
export const isAuthorizedUser = async (userId, authorId, requireAdmin = true) => {
	if (userId === authorId || userId === authorId.toString()) {
		return true
	}
	return requireAdmin ? await isAdmin(userId) : await isModerator(userId) || await isAdmin(userId)
}
