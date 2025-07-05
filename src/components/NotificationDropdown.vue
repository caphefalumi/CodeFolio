<template>
	<div class="notification-wrapper" v-if="show">
		<!-- Notifications Dropdown -->
		<div class="notification-dropdown" @click.stop>
			<div class="notification-card">
				<!-- Header -->
				<div class="notification-header">
					<div class="d-flex align-center justify-space-between">
						<h3 class="notification-title">Notifications</h3>
						<div class="d-flex align-center">
							<v-btn
								icon
								size="small"
								variant="text"
								@click="$emit('close')"
								class="header-btn"
								aria-label="Close notifications"
							>
								<v-icon size="18">mdi-close</v-icon>
							</v-btn>
						</div>
					</div>

					<!-- Action buttons row -->
					<div
						v-if="unreadCount > 0"
						class="d-flex align-center justify-space-between mt-2"
					>
						<span class="unread-count"
							>{{ unreadCount }} new notification{{
								unreadCount > 1 ? "s" : ""
							}}</span
						>
						<v-btn
							variant="text"
							size="small"
							color="primary"
							@click="markAllAsRead"
							class="mark-read-btn"
						>
							Mark all as read
						</v-btn>
					</div>
				</div>

				<!-- Content Area -->
				<div class="notification-content">
					<!-- Loading State -->
					<div v-if="loading" class="pa-6 text-center">
						<v-progress-circular
							indeterminate
							size="32"
							color="primary"
						></v-progress-circular>
						<div class="mt-3 text-body-2 text-medium-emphasis">
							Loading notifications...
						</div>
					</div>

					<!-- Empty State -->
					<div v-else-if="notifications.length === 0" class="pa-8 text-center">
						<div class="empty-state">
							<v-icon size="64" class="mb-3 text-disabled"
								>mdi-bell-outline</v-icon
							>
							<h4 class="text-h6 text-medium-emphasis mb-2">
								No notifications yet
							</h4>
							<p class="text-body-2 text-disabled">
								We'll notify you when something happens
							</p>
						</div>
					</div>

					<!-- Notifications List -->
					<div v-else class="notifications-list">
						<div
							v-for="notification in notifications"
							:key="notification._id"
							:class="[
								'notification-item',
								{ 'notification-unread': !notification.isRead },
							]"
							@click="handleNotificationClick(notification)"
						>
							<!-- Avatar -->
							<div class="notification-avatar">
								<v-avatar size="40">
									<v-img
										v-if="notification.sender?.avatar"
										:src="notification.sender.avatar"
										:alt="`${notification.sender.username} avatar`"
									></v-img>
									<v-icon v-else color="primary">mdi-account-circle</v-icon>
								</v-avatar>
								<!-- Unread indicator -->
								<div v-if="!notification.isRead" class="unread-dot"></div>
							</div>

							<!-- Content -->
							<div class="notification-body">
								<div class="notification-text">
									{{ notification.message }}
								</div>
								<div class="notification-meta">
									<span class="notification-time">{{
										formatTime(notification.createdAt)
									}}</span>
								</div>
							</div>

							<!-- Actions -->
							<div class="notification-actions">
								<v-menu offset-y>
									<template v-slot:activator="{ props }">
										<v-btn
											icon
											size="small"
											variant="text"
											v-bind="props"
											@click.stop
											class="action-btn"
										>
											<v-icon size="18">mdi-dots-horizontal</v-icon>
										</v-btn>
									</template>
									<v-list density="compact">
										<v-list-item
											v-if="!notification.isRead"
											@click="markAsRead(notification._id)"
											prepend-icon="mdi-check"
										>
											<v-list-item-title>Mark as read</v-list-item-title>
										</v-list-item>
										<v-list-item
											@click="deleteNotification(notification._id)"
											prepend-icon="mdi-delete"
											class="text-error"
										>
											<v-list-item-title>Remove notification</v-list-item-title>
										</v-list-item>
									</v-list>
								</v-menu>
							</div>
						</div>
					</div>
				</div>

				<!-- Footer -->
				<div v-if="notifications.length > 0" class="notification-footer">
					<v-btn
						variant="text"
						color="error"
						size="small"
						@click="clearAllNotifications"
						:disabled="loading"
						block
						class="text-caption"
					>
						<v-icon size="16" class="mr-1">mdi-delete-sweep</v-icon>
						Clear All Notifications
					</v-btn>
				</div>
			</div>
		</div>
		<!-- Click outside overlay -->
		<div class="notification-overlay" @click="$emit('close')"></div>
	</div>
</template>

<script>
	import axios from "axios"
	import { getAccessToken } from "@/composables/user.js"

	export default {
		name: "NotificationDropdown",
		components: {},
		props: {
			show: {
				type: Boolean,
				default: false,
			},
		},
		emits: ["close", "update-unread-count"],
		data() {
			return {
				notifications: [],
				unreadCount: 0,
				loading: false,
			}
		},
		computed: {
			isAuthenticated() {
				return !!getAccessToken()
			},
		},
		mounted() {
			if (this.isAuthenticated && this.show) {
				this.loadNotifications()
			}
		},

		watch: {
			isAuthenticated(newVal) {
				if (newVal) {
					this.loadNotifications()
				} else {
					this.notifications = []
					this.unreadCount = 0
				}
			},
			show(newVal) {
				if (newVal && this.isAuthenticated) {
					this.loadNotifications()
				}
			},
		},
		methods: {
			async loadNotifications() {
				if (!this.isAuthenticated) return

				this.loading = true
				try {
					const token = getAccessToken()
					const response = await axios.get(
						`${import.meta.env.VITE_SERVER_URL}/api/notifications`,
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					)
					this.notifications = response.data
					this.updateUnreadCount()
				} catch (error) {
					console.error("Error loading notifications:", error)
				} finally {
					this.loading = false
				}
			},

			async loadUnreadCount() {
				if (!this.isAuthenticated) return

				try {
					const token = getAccessToken()
					const response = await axios.get(
						`${import.meta.env.VITE_SERVER_URL}/api/notifications/unread-count`,
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					)
					this.unreadCount = response.data.unreadCount
				} catch (error) {
					console.error("Error loading unread count:", error)
				}
			},
			updateUnreadCount() {
				this.unreadCount = this.notifications.filter(n => !n.isRead).length
				this.$emit("update-unread-count", this.unreadCount)
			},

			async markAsRead(notificationId) {
				try {
					const token = getAccessToken()
					await axios.patch(
						`${import.meta.env.VITE_SERVER_URL}/api/notifications/${notificationId}/read`,
						{},
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					)

					// Update local state
					const notification = this.notifications.find(
						n => n._id === notificationId
					)
					if (notification) {
						notification.isRead = true
						this.updateUnreadCount()
					}
				} catch (error) {
					console.error("Error marking notification as read:", error)
				}
			},

			async markAllAsRead() {
				try {
					const token = getAccessToken()
					await axios.patch(
						`${import.meta.env.VITE_SERVER_URL}/api/notifications/read-all`,
						{},
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					)

					// Update local state
					this.notifications.forEach(n => (n.isRead = true))
					this.updateUnreadCount()
				} catch (error) {
					console.error("Error marking all notifications as read:", error)
				}
			},

			async deleteNotification(notificationId) {
				try {
					const token = getAccessToken()
					await axios.delete(
						`${import.meta.env.VITE_SERVER_URL}/api/notifications/${notificationId}`,
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					)

					// Remove from local state
					this.notifications = this.notifications.filter(
						n => n._id !== notificationId
					)
					this.updateUnreadCount()
				} catch (error) {
					console.error("Error deleting notification:", error)
				}
			},

			async clearAllNotifications() {
				if (!confirm("Are you sure you want to delete all notifications?"))
					return

				try {
					const token = getAccessToken()
					await axios.delete(
						`${import.meta.env.VITE_SERVER_URL}/api/notifications`,
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					)

					// Clear local state
					this.notifications = []
					this.unreadCount = 0
				} catch (error) {
					console.error("Error clearing all notifications:", error)
				}
			},
			handleNotificationClick(notification) {
				console.log("Notification clicked:", notification)

				// Mark as read if not already
				if (!notification.isRead) {
					this.markAsRead(notification._id)
				}

				// Navigate based on notification type
				if (notification.type === "follow") {
					// For follow notifications, redirect to the sender's profile
					if (notification.sender && notification.sender.username) {
						console.log("Navigating to profile:", notification.sender.username)
						const targetRoute = `/${notification.sender.username}`
						this.navigateToRoute(targetRoute)
					}
				} else if (
					notification.relatedPost &&
					notification.relatedPost.author
				) {
					// For mention, comment, and like notifications, redirect to the post
					const fullPath = `${notification.relatedPost.author.username}/${notification.relatedPost._id}`
					console.log("Navigating to post:", fullPath)
					const targetRoute = `/${fullPath}`
					this.navigateToRoute(targetRoute)
				}

				// Close the dropdown
				this.$emit("close")
			},
			navigateToRoute(targetRoute) {
				// Use router navigation with query parameter to force refresh
				if (this.$route.path === targetRoute) {
					// If we're already on the target route, add a timestamp to force refresh
					this.$router.push({
						path: targetRoute,
						query: { t: Date.now() },
					})
				} else {
					// Navigate to new route
					this.$router.push(targetRoute)
				}
			},

			formatTime(timestamp) {
				const now = new Date()
				const time = new Date(timestamp)
				const diff = now - time
				const minutes = Math.floor(diff / 60000)
				const hours = Math.floor(diff / 3600000)
				const days = Math.floor(diff / 86400000)

				if (minutes < 1) return "Just now"
				if (minutes < 60) return `${minutes}m ago`
				if (hours < 24) return `${hours}h ago`
				if (days < 7) return `${days}d ago`
				return time.toLocaleDateString()
			},
		},
	}
</script>

<style scoped>
	.notification-wrapper {
		position: fixed;
		top: 64px; /* Below the app bar */
		right: 16px;
		z-index: 9999;
	}
	.notification-dropdown {
		position: relative;
		width: 360px;
		animation: dropdownSlide 0.2s ease-out;
	}

	.notification-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 9998;
		background: transparent;
	}

	.notification-card {
		background: rgb(var(--v-theme-surface));
		color: rgb(var(--v-theme-on-surface));
		border-radius: 12px;
		box-shadow: 0 8px 32px rgba(var(--v-theme-shadow-key-umbra-opacity), 0.15);
		border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
		overflow: hidden;
		position: relative;
		z-index: 10000;
	}

	.notification-header {
		padding: 16px;
		background: rgb(var(--v-theme-surface));
		border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
		position: relative;
		z-index: 10001;
	}

	.notification-title {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0;
		color: rgb(var(--v-theme-on-surface));
	}

	.header-btn {
		color: rgb(var(--v-theme-on-surface-variant)) !important;
		margin-left: 4px;
	}

	.header-btn:hover {
		background-color: rgba(var(--v-theme-on-surface), 0.05) !important;
	}

	.unread-count {
		font-size: 0.875rem;
		color: rgb(var(--v-theme-primary));
		font-weight: 600;
	}

	.mark-read-btn {
		font-size: 0.75rem;
		text-transform: none;
		padding: 4px 8px;
		min-width: auto;
		height: auto;
	}

	.notification-content {
		max-height: 480px;
		overflow-y: auto;
		background: rgb(var(--v-theme-surface));
		position: relative;
		z-index: 10001;
	}

	.notifications-list {
		padding: 0;
	}

	.notification-item {
		display: flex;
		align-items: flex-start;
		padding: 12px 16px;
		cursor: pointer;
		position: relative;
		transition: all 0.15s ease;
		border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.04);
	}

	.notification-item:hover {
		background-color: rgba(var(--v-theme-on-surface), 0.05);
	}

	.notification-item:last-child {
		border-bottom: none;
	}

	.notification-unread {
		background-color: rgba(var(--v-theme-primary), 0.08);
	}

	.notification-unread:hover {
		background-color: rgba(var(--v-theme-primary), 0.12);
	}

	.notification-avatar {
		position: relative;
		margin-right: 12px;
		flex-shrink: 0;
	}

	.unread-dot {
		position: absolute;
		top: -2px;
		right: -2px;
		width: 12px;
		height: 12px;
		background: rgb(var(--v-theme-primary));
		border: 2px solid rgb(var(--v-theme-surface));
		border-radius: 50%;
	}

	.notification-body {
		flex: 1;
		min-width: 0;
		margin-right: 8px;
	}

	.notification-text {
		font-size: 0.875rem;
		line-height: 1.4;
		color: rgb(var(--v-theme-on-surface));
		margin-bottom: 4px;
		word-wrap: break-word;
	}

	.notification-meta {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.notification-time {
		font-size: 0.75rem;
		color: rgb(var(--v-theme-on-surface-variant));
		font-weight: 500;
	}

	.notification-actions {
		opacity: 0;
		transition: opacity 0.2s ease;
	}

	.notification-item:hover .notification-actions {
		opacity: 1;
	}

	.action-btn {
		color: rgb(var(--v-theme-on-surface-variant)) !important;
	}

	.action-btn:hover {
		background-color: rgba(var(--v-theme-on-surface), 0.05) !important;
	}

	.empty-state {
		text-align: center;
		padding: 32px 16px;
	}

	.notification-footer {
		padding: 12px 16px;
		border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
		background: rgb(var(--v-theme-surface));
		position: relative;
		z-index: 10001;
	}

	/* Custom scrollbar */
	.notification-content::-webkit-scrollbar {
		width: 6px;
	}

	.notification-content::-webkit-scrollbar-track {
		background: transparent;
	}

	.notification-content::-webkit-scrollbar-thumb {
		background: rgba(var(--v-theme-on-surface), 0.2);
		border-radius: 3px;
	}

	.notification-content::-webkit-scrollbar-thumb:hover {
		background: rgba(var(--v-theme-on-surface), 0.3);
	}

	/* Dropdown animation */
	@keyframes dropdownSlide {
		from {
			opacity: 0;
			transform: translateY(-10px) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	/* Focus styles for accessibility */
	.notification-item:focus {
		outline: 2px solid rgb(var(--v-theme-primary));
		outline-offset: -2px;
	}
</style>
