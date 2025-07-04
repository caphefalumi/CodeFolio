import User from "../models/User.js"

export const isAdmin = async userId => {
	try {
		const user = await User.findById(userId)
		return user && user.email === "dangduytoan13l@gmail.com"
	} catch (error) {
		console.error("Error checking admin status:", error)
		return false
	}
}

export const isAuthorizedUser = async (userId, authorId) => {
	if (userId === authorId || userId === authorId.toString()) {
		return true
	}
	return await isAdmin(userId)
}
