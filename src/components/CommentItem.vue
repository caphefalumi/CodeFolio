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
					></v-img>
					<span v-else class="text-white text-subtitle-1">
						{{ safeUserData.username.charAt(0).toUpperCase() }}
					</span>
				</v-avatar>
			</template>
			<div class="comment-content flex-grow-1">
				<div class="d-flex align-center mb-1">
					<v-btn
						variant="text"
						color="primary"
						class="font-weight-medium text-subtitle-2 mr-2 pa-0"
						style="
							text-transform: none;
							min-width: auto;
							height: auto;
							font-size: inherit;
						"
						@click="handleUsernameClick"
					>
						{{ safeUserData.username }}
					</v-btn>
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
				submittingReply: false
			}
		},
		computed: {
			isAuthenticated() {
				return isLoggedIn()
			}, // Ensure user data exists and has required fields
			safeUserData() {
				const user = this.comment?.user

				if (!user || typeof user === "string") {
					// Handle case where user is deleted or only an ObjectId string
					return {
						username: "Deleted User",
						avatar: null,
						_id: null,
					}
				}

				// Ensure required fields exist
				return {
					username: user.username || "Deleted User",
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
					// Add a placeholder user object using Vue 3 approach
					this.comment.user = {
						username: "Deleted User",
						avatar: null,
						_id: null,
					}
				}

				// Validate replies if they exist
				if (this.comment.replies && Array.isArray(this.comment.replies)) {
					this.comment.replies.forEach((reply, index) => {
						if (!reply.user) {
							console.warn(
								`CommentItem: Missing user data for reply ${index}:`,
								reply._id
							) // Use direct assignment in Vue 3
							reply.user = {
								username: "Deleted User",
								avatar: null,
								_id: null,
							}
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
					this.showReplyForm = true
					return
				}
				this.toggleReplyForm()
			},
			toggleReplyForm() {
				this.showReplyForm = !this.showReplyForm
				if (!this.showReplyForm) {
					this.replyContent = ""
				}
			},
			cancelReply() {
				this.showReplyForm = false
				this.replyContent = ""
			},
			async submitReply() {
				if (!this.replyContent.trim()) return

				if (!this.isAuthenticated) {
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
				} catch (error) {
					console.error("Error adding reply:", error)
				} finally {
					this.submittingReply = false
				}
			},
			handleMentionClick(username) {
				// Navigate to user profile
				console.log("Mention clicked:", username)
				const targetRoute = `/${username}`
				// Use router.push with force refresh if on same route
				this.$router.push(targetRoute).catch(() => {
					// If route is the same, force component reload by adding timestamp query
					this.$router.push({
						path: targetRoute,
						query: { t: Date.now() },
					})
				})
			},
			handleUsernameClick() {
				console.log("Username clicked:", this.safeUserData.username)
				if (
					this.safeUserData.username &&
					this.safeUserData.username !== "Deleted User"
				) {
					const targetRoute = `/${this.safeUserData.username}`
					console.log("Navigating to:", targetRoute)
					// Use router.push with force refresh if on same route
					this.$router.push(targetRoute).catch(() => {
						// If route is the same, force component reload by adding timestamp query
						this.$router.push({
							path: targetRoute,
							query: { t: Date.now() },
						})
					})
				} else {
					console.warn(
						"Cannot navigate - user was deleted:",
						this.safeUserData.username
					)
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
