<template>
	<div class="comment-item">
		<v-list-item class="pa-0 mb-3">
			<template v-slot:prepend>
				<v-avatar
					size="40"
					:color="safeUserData.avatar ? 'transparent' : 'primary'"
					class="mr-3"
					:aria-label="`${safeUserData.username} avatar`"
				>
					<v-img
						v-if="safeUserData.avatar"
						:src="safeUserData.avatar"
						:alt="`${safeUserData.username} avatar`"
						cover
						@error="onAvatarError"
					></v-img>
					<span v-else class="text-white text-subtitle-1">
						{{ safeUserData.username.charAt(0).toUpperCase() }}
					</span>
				</v-avatar>
			</template>

			<div class="comment-content flex-grow-1">
				<div class="d-flex align-center mb-1">
					<span class="font-weight-medium text-subtitle-2 mr-2">
						{{ safeUserData.username }}
					</span>
					<span class="text-caption text-grey">
						{{ formatDate(comment.createdAt) }}
					</span>
				</div>
				<div class="text-body-2 mb-2">
					<comment-content
						:content="comment.content"
						@mention-click="handleMentionClick"
					/>
				</div>
				<div class="comment-actions">
					<v-btn
						v-if="!isReply"
						size="small"
						variant="text"
						color="primary"
						@click="handleReplyClick"
						class="text-caption pa-1"
						style="min-width: auto"
					>
						{{ showReplyForm ? "Cancel" : "Reply" }}
					</v-btn>
				</div>
				<!-- Reply Form -->
				<div v-if="showReplyForm && !isReply" class="mt-3">
					<!-- Authentication Alert -->
					<v-alert
						v-if="showAuthAlert"
						type="warning"
						class="mb-3"
						border="start"
						colored-border
						density="compact"
					>
						<template #prepend>
							<v-icon>mdi-account-alert</v-icon>
						</template>
						<div class="d-flex align-center justify-space-between">
							<span>You must be logged in to reply to comments.</span>
							<v-btn
								size="small"
								variant="outlined"
								color="primary"
								to="/login"
								class="ml-3"
							>
								Login
							</v-btn>
						</div>
					</v-alert>
					<mention-textarea
						v-model="replyContent"
						label="Write a reply..."
						:rows="2"
						variant="outlined"
						density="compact"
						:hide-details="true"
						textarea-class="mb-2"
						:disabled="!isAuthenticated"
					/>
					<div class="d-flex justify-end gap-2">
						<v-btn
							size="small"
							variant="outlined"
							@click="cancelReply"
							:disabled="submittingReply"
						>
							Cancel
						</v-btn>
						<v-btn
							size="small"
							color="primary"
							@click="submitReply"
							:loading="submittingReply"
							:disabled="!replyContent.trim() || !isAuthenticated"
						>
							Reply
						</v-btn>
					</div>
				</div>

				<!-- Replies -->
				<div
					v-if="!isReply && comment.replies && comment.replies.length > 0"
					class="replies-section mt-4"
				>
					<div class="replies-container">
						<comment-item
							v-for="reply in comment.replies"
							:key="reply._id"
							:comment="reply"
							:is-reply="true"
							class="reply-item"
						/>
					</div>
				</div>
			</div>
		</v-list-item>
	</div>
</template>

<script>
	import axios from "axios"
	import { getAccessToken, isLoggedIn } from "@/composables/user.js"
	import MentionTextarea from "./MentionTextarea.vue"
	import CommentContent from "./CommentContent.vue"

	export default {
		name: "CommentItem",
		components: {
			MentionTextarea,
			CommentContent,
		},
		props: {
			comment: {
				type: Object,
				required: true,
			},
			isReply: {
				type: Boolean,
				default: false,
			},
			postId: {
				type: String,
				required: true,
			},
		},
		emits: ["reply-added"],
		data() {
			return {
				showReplyForm: false,
				replyContent: "",
				submittingReply: false,
				showAuthAlert: false,
			}
		},
		computed: {
			isAuthenticated() {
				return isLoggedIn()
			},
			// Ensure user data exists and has required fields
			safeUserData() {
				const user = this.comment?.user
				if (!user) {
					return {
						username: "Unknown User",
						avatar: null,
						_id: null,
					}
				}

				// Ensure required fields exist
				return {
					username: user.username || "Unknown User",
					avatar: user.avatar || null,
					_id: user._id || null,
				}
			},
		},
		mounted() {
			// Validate comment data on component mount
			this.validateCommentData()
		},
		methods: {
			validateCommentData() {
				// Log any data issues for debugging
				if (!this.comment) {
					console.warn("CommentItem: No comment data provided")
					return
				}

				if (!this.comment.user) {
					console.warn(
						"CommentItem: Missing user data for comment:",
						this.comment._id
					)
					// Add a placeholder user object
					this.$set(this.comment, "user", {
						username: "Unknown User",
						avatar: null,
						_id: null,
					})
				}

				// Validate replies if they exist
				if (this.comment.replies && Array.isArray(this.comment.replies)) {
					this.comment.replies.forEach((reply, index) => {
						if (!reply.user) {
							console.warn(
								`CommentItem: Missing user data for reply ${index}:`,
								reply._id
							)
							this.$set(reply, "user", {
								username: "Unknown User",
								avatar: null,
								_id: null,
							})
						}
					})
				}
			},
			formatDate(dateString) {
				return new Date(dateString).toLocaleDateString("en-US", {
					year: "numeric",
					month: "short",
					day: "numeric",
					hour: "2-digit",
					minute: "2-digit",
				})
			},
			handleReplyClick() {
				if (!this.isAuthenticated) {
					this.showAuthAlert = true
					this.showReplyForm = true
					return
				}
				this.toggleReplyForm()
			},
			toggleReplyForm() {
				this.showReplyForm = !this.showReplyForm
				if (!this.showReplyForm) {
					this.replyContent = ""
					this.showAuthAlert = false
				}
			},
			cancelReply() {
				this.showReplyForm = false
				this.replyContent = ""
				this.showAuthAlert = false
			},
			async submitReply() {
				if (!this.replyContent.trim()) return

				if (!this.isAuthenticated) {
					this.showAuthAlert = true
					return
				}

				this.submittingReply = true
				try {
					const token = getAccessToken()
					await axios.post(
						`${import.meta.env.VITE_SERVER_URL}/api/posts/${this.postId}/comments/${this.comment._id}/replies`,
						{ content: this.replyContent },
						{ headers: { Authorization: `Bearer ${token}` } }
					)

					this.$emit("reply-added")
					this.replyContent = ""
					this.showReplyForm = false
					this.showAuthAlert = false
				} catch (error) {
					console.error("Error adding reply:", error)
					if (error.response && error.response.status === 401) {
						this.showAuthAlert = true
					}
				} finally {
					this.submittingReply = false
				}
			},
			handleMentionClick(username) {
				// Navigate to user profile
				this.$router.push(`/${username}`)
			},
			onAvatarError(event) {
				// Handle avatar loading errors
				console.warn(
					"Avatar failed to load for user:",
					this.comment.user?.username,
					this.comment.user?.avatar
				)
				// Remove the avatar URL to show fallback initial
				if (this.comment.user) {
					this.comment.user.avatar = null
				}
			},
		},
	}
</script>

<style scoped>
	.comment-item {
		border-left: 2px solid transparent;
	}

	.reply-item {
		margin-left: 20px;
		border-left: 2px solid #e0e0e0;
		padding-left: 16px;
	}

	.replies-container {
		margin-top: 16px;
	}

	.comment-content {
		width: 100%;
	}

	.comment-actions {
		margin-top: 4px;
	}
</style>
