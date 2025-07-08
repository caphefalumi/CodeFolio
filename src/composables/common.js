// Composable for common API operations
import axios from "axios"
import { ref, computed } from "vue"

export function useApi() {
	const loading = ref(false)
	const error = ref("")
	const success = ref("")

	const getAuthHeaders = token => ({
		headers: { Authorization: `Bearer ${token}` },
	})

	const getAuthHeadersWithFormData = token => ({
		headers: {
			"Content-Type": "multipart/form-data",
			Authorization: `Bearer ${token}`,
		},
	})
	const handleError = (err, defaultMessage = "An error occurred") => {
		error.value = err.response?.data?.message || err.message || defaultMessage
		return error.value
	}

	const getErrorMessage = (err, defaultMessage = "An error occurred") => {
		return err.response?.data?.message || err.message || defaultMessage
	}

	const clearMessages = () => {
		error.value = ""
		success.value = ""
	}

	const apiCall = async (apiFunction, successMessage = "") => {
		loading.value = true
		clearMessages()

		try {
			const result = await apiFunction()
			if (successMessage) {
				success.value = successMessage
			}
			return result
		} catch (err) {
			handleError(err)
			throw err
		} finally {
			loading.value = false
		}
	}

	// Common API operations
	const uploadImage = async (file, endpoint, token) => {
		const formData = new FormData()
		formData.append("image", file)

		const response = await axios.post(
			endpoint,
			formData,
			getAuthHeadersWithFormData(token)
		)
		return response.data.uri
	}
	const createPost = async (payload, token) => {
		const response = await axios.post(
			`${import.meta.env.VITE_SERVER_URL}/api/posts`,
			payload,
			getAuthHeaders(token)
		)
		return response.data.post
	}

	const updatePost = async (id, payload, token) => {
		const response = await axios.patch(
			`${import.meta.env.VITE_SERVER_URL}/api/posts/${id}`,
			payload,
			getAuthHeaders(token)
		)
		return response.data.post
	}

	const deletePost = async (id, token) => {
		try {
			console.log("Attempting to delete post with ID:", id)
			await axios.delete(
				`${import.meta.env.VITE_SERVER_URL}/api/posts/${id}`,
				getAuthHeaders(token)
			)
		} catch {
			console.error(`Failed to delete post with ID: ${id}`)
		}
	}
	const updateUser = async (payload, token) => {
		const response = await axios.patch(
			`${import.meta.env.VITE_SERVER_URL}/api/users`,
			payload,
			getAuthHeaders(token)
		)
		return response.data
	}

	// Notification operations
	const fetchNotifications = async token => {
		const response = await axios.get(
			`${import.meta.env.VITE_SERVER_URL}/api/notifications`,
			getAuthHeaders(token)
		)
		return response.data
	}

	const fetchUnreadCount = async token => {
		const response = await axios.get(
			`${import.meta.env.VITE_SERVER_URL}/api/notifications/unread-count`,
			getAuthHeaders(token)
		)
		return response.data.unreadCount
	}

	const markNotificationAsRead = async (notificationId, token) => {
		const response = await axios.patch(
			`${import.meta.env.VITE_SERVER_URL}/api/notifications/${notificationId}/read`,
			{},
			getAuthHeaders(token)
		)
		return response.data
	}

	const markAllNotificationsAsRead = async token => {
		const response = await axios.patch(
			`${import.meta.env.VITE_SERVER_URL}/api/notifications/read-all`,
			{},
			getAuthHeaders(token)
		)
		return response.data
	}

	const deleteNotification = async (notificationId, token) => {
		const response = await axios.delete(
			`${import.meta.env.VITE_SERVER_URL}/api/notifications/${notificationId}`,
			getAuthHeaders(token)
		)
		return response.data
	}
	const deleteAllNotifications = async token => {
		const response = await axios.delete(
			`${import.meta.env.VITE_SERVER_URL}/api/notifications`,
			getAuthHeaders(token)
		)
		return response.data
	}
	return {
		loading: computed(() => loading.value),
		error: computed(() => error.value),
		success: computed(() => success.value),
		clearMessages,
		handleError,
		getErrorMessage,
		apiCall,
		getAuthHeaders,
		getAuthHeadersWithFormData,
		uploadImage,
		createPost,
		updatePost,
		deletePost,
		updateUser,
		// Notification functions
		fetchNotifications,
		fetchUnreadCount,
		markNotificationAsRead,
		markAllNotificationsAsRead,
		deleteNotification,
		deleteAllNotifications,
	}
}
