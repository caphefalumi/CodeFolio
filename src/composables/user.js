import axios from "axios"

export function getAccessToken() {
	return sessionStorage.getItem("accessToken")
}

export function isLoggedIn() {
	return !!getAccessToken()
}

export async function fetchCurrentUser() {
	try {
		const res = await axios.get(
			`${import.meta.env.VITE_SERVER_URL}/api/users/me`,
			{
				headers: { Authorization: `Bearer ${getAccessToken()}` },
			}
		)
		return res.data
	} catch (error) {
		console.error("Error fetching current user:", error)
	}
}

export async function fetchProfile(username) {
	try {
		const res = await axios.get(
			`${import.meta.env.VITE_SERVER_URL}/api/users/${username}`
		)
		return res.data
	} catch (error) {
		console.error(`Error fetching profile for user "${username}":`, error)
	}
}

export async function fetchProjects(username) {
	try {
		const res = await axios.get(
			`${import.meta.env.VITE_SERVER_URL}/api/posts/${username}`
		)
		return res.data
	} catch (error) {
		console.error(`Error fetching projects for user "${username}":`, error)
	}
}
