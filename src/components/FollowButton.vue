<template>
	<v-btn
		:color="isFollowing ? 'grey' : 'primary'"
		:variant="isFollowing ? 'outlined' : 'flat'"
		:loading="loading"
		:disabled="!canFollow || loading"
		@click="toggleFollow"
		:aria-label="isFollowing ? `Unfollow ${username}` : `Follow ${username}`"
	>
		<v-icon left>
			{{ isFollowing ? "mdi-account-minus" : "mdi-account-plus" }}
		</v-icon>
		{{ isFollowing ? $t("followingUser") : $t("follow") }}
	</v-btn>
</template>

<script>
	import { getAccessToken } from "@/composables/user.js"
	import axios from "axios"

	export default {
		name: "FollowButton",
		props: {
			userId: {
				type: String,
				required: true,
			},
			username: {
				type: String,
				required: true,
			},
			initialFollowState: {
				type: Boolean,
				default: false,
			},
		},
		emits: ["follow-changed"],
		data() {
			return {
				isFollowing: this.initialFollowState,
				canFollow: true,
				loading: false,
				checkingStatus: true,
			}
		},
		async mounted() {
			await this.checkFollowStatus()
		},
		methods: {
			async checkFollowStatus() {
				try {
					const token = getAccessToken()
					if (!token) {
						this.canFollow = false
						this.checkingStatus = false
						return
					}

					const response = await axios.get(
						`${import.meta.env.VITE_SERVER_URL}/api/users/${this.userId}/follow-status`,
						{ headers: { Authorization: `Bearer ${token}` } }
					)

					this.isFollowing = response.data.isFollowing
					this.canFollow = response.data.canFollow
				} catch (error) {
					console.error("Error checking follow status:", error)
					this.canFollow = false
				} finally {
					this.checkingStatus = false
				}
			},

			async toggleFollow() {
				this.loading = true
				try {
					const token = getAccessToken()
					if (!token) {
						throw new Error("Not authenticated")
					}

					if (this.isFollowing) {
						// Unfollow
						const response = await axios.delete(
							`${import.meta.env.VITE_SERVER_URL}/api/users/${this.userId}/follow`,
							{ headers: { Authorization: `Bearer ${token}` } }
						)
						this.isFollowing = false
						this.$emit("follow-changed", {
							isFollowing: false,
							followersCount: response.data.followersCount,
							followingCount: response.data.followingCount,
						})
					} else {
						// Follow
						const response = await axios.post(
							`${import.meta.env.VITE_SERVER_URL}/api/users/${this.userId}/follow`,
							{},
							{ headers: { Authorization: `Bearer ${token}` } }
						)
						this.isFollowing = true
						this.$emit("follow-changed", {
							isFollowing: true,
							followersCount: response.data.followersCount,
							followingCount: response.data.followingCount,
						})
					}
				} catch (error) {
					console.error("Error toggling follow:", error)
					// Show error message to user
					this.$emit(
						"error",
						error.response?.data?.message || "Failed to update follow status"
					)
				} finally {
					this.loading = false
				}
			},
		},
	}
</script>
