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
						<span v-if="comment.edited" class="ml-1 text-grey-darken-1">
							{{ $t("edited") }}
						</span>
					</span>
				</div>
				<div class="text-body-2 mb-2">
					<!-- Show edit form if editing -->
					<div v-if="isEditing">
						<mention-textarea
							v-model="editContent"
							:label="$t('editComment')"
							:rows="3"
							variant="outlined"
							density="compact"
							:hide-details="true"
							class="mb-2"
						/>
						<div class="d-flex justify-end gap-2">
							<v-btn
								size="small"
								variant="outlined"
								@click="cancelEdit"
								:disabled="savingEdit"
							>
								{{ $t("cancel") }}
							</v-btn>
							<v-btn
								size="small"
								color="primary"
								@click="saveEdit"
								:loading="savingEdit"
								:disabled="!editContent.trim()"
							>
								{{ $t("save") }}
							</v-btn>
						</div>
					</div>
					<!-- Show comment content if not editing -->
					<div v-else>
						<comment-content
							:content="comment.content"
							@mention-click="handleMentionClick"
						/>
					</div>
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
						{{ showReplyForm ? $t("cancel") : $t("reply") }}
					</v-btn>
					<!-- Reply button for replies (to mention the reply author) -->
					<v-btn
						v-if="isReply"
						size="small"
						variant="text"
						color="primary"
						@click="handleReplyToReplyClick"
						class="text-caption pa-1"
						style="min-width: auto"
					>
						{{ $t("reply") }}
					</v-btn>

					<!-- Edit and Delete buttons for comment author -->
					<template v-if="canEditDelete && !isEditing">
						<v-btn
							size="small"
							variant="text"
							color="primary"
							@click="startEdit"
							class="text-caption pa-1 ml-2"
							style="min-width: auto"
						>
							{{ $t("edit") }}
						</v-btn>
						<v-btn
							size="small"
							variant="text"
							color="error"
							@click="confirmDelete"
							class="text-caption pa-1 ml-2"
							style="min-width: auto"
						>
							{{ $t("delete") }}
						</v-btn>
					</template>
				</div>
				<!-- Reply Form -->
				<div v-if="showReplyForm && !isReply" class="mt-3">
					<!-- Authentication Alert -->
					<mention-textarea
						v-model="replyContent"
						:label="$t('addComment')"
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
							{{ $t("cancel") }}
						</v-btn>
						<v-btn
							size="small"
							color="primary"
							@click="submitReply"
							:loading="submittingReply"
							:disabled="!replyContent.trim() || !isAuthenticated"
						>
							{{ $t("postComment") }}
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
							:post-id="postId"
							:parent-comment-id="comment._id"
							@reply-added="$emit('reply-added')"
							@reply-to-reply="handleReplyToReplyEvent"
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
			parentCommentId: {
				type: String,
				default: null,
			},
		},
		emits: ["reply-added", "reply-to-reply"],
		data() {
			return {
				showReplyForm: false,
				replyContent: "",
				submittingReply: false,
				isEditing: false,
				editContent: "",
				savingEdit: false,
			}
		},
		computed: {
			isAuthenticated() {
				return isLoggedIn()
			},
			safeUserData() {
				const user = this.comment?.user

				if (!user || typeof user === "string") {
					return {
						username: "Deleted User",
						avatar: null,
						_id: null,
					}
				}

				return {
					username: user.username || "Deleted User",
					avatar: user.avatar || null,
					_id: user._id || null,
				}
			},
			canEditDelete() {
				if (!this.isAuthenticated || !this.comment?.user?._id) return false

				// Get current user ID from token
				const token = getAccessToken()
				if (!token) return false

				try {
					const payload = JSON.parse(atob(token.split(".")[1]))
					return payload.id === this.comment.user._id
				} catch (error) {
					return false
				}
			},
		},
		mounted() {
			this.validateCommentData()
		},
		methods: {
			validateCommentData() {
				if (!this.comment) {
					console.warn("CommentItem: No comment data provided")
					return
				}
				if (!this.comment.user) {
					console.warn(
						"CommentItem: Missing user data for comment:",
						this.comment._id
					)
					this.comment.user = {
						username: "Deleted User",
						avatar: null,
						_id: null,
					}
				}

				if (this.comment.replies && Array.isArray(this.comment.replies)) {
					this.comment.replies.forEach((reply, index) => {
						if (!reply.user) {
							console.warn(
								`CommentItem: Missing user data for reply ${index}:`,
								reply._id
							)
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
			toggleReplyForm(mentionUsername = null) {
				this.showReplyForm = !this.showReplyForm
				if (!this.showReplyForm) {
					this.replyContent = ""
				} else if (mentionUsername) {
					// Auto-mention the user when replying
					this.replyContent = `@${mentionUsername} `
				}
			},
			handleReplyToReplyClick() {
				// Emit event to parent comment to open reply form with mention
				this.$emit("reply-to-reply", {
					mentionUsername: this.safeUserData.username,
					commentId: this.parentCommentId,
				})
			},
			handleReplyToReplyEvent(eventData) {
				// Handle reply-to-reply event from child reply
				if (eventData.commentId === this.comment._id) {
					this.toggleReplyForm(eventData.mentionUsername)
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
			startEdit() {
				this.isEditing = true
				this.editContent = this.comment.content
			},
			cancelEdit() {
				this.isEditing = false
				this.editContent = ""
			},
			async saveEdit() {
				if (!this.editContent.trim()) return

				this.savingEdit = true
				try {
					const token = getAccessToken()
					const endpoint = this.isReply
						? `${import.meta.env.VITE_SERVER_URL}/api/posts/${this.postId}/comments/${this.parentCommentId}/replies/${this.comment._id}`
						: `${import.meta.env.VITE_SERVER_URL}/api/posts/${this.postId}/comments/${this.comment._id}`

					await axios.put(
						endpoint,
						{ content: this.editContent },
						{ headers: { Authorization: `Bearer ${token}` } }
					)

					this.$emit("reply-added") // Refresh the comments
					this.isEditing = false
					this.editContent = ""
				} catch (error) {
					console.error("Error editing comment:", error)
				} finally {
					this.savingEdit = false
				}
			},
			confirmDelete() {
				if (confirm(this.$t("confirmDelete"))) {
					this.deleteComment()
				}
			},
			async deleteComment() {
				try {
					const token = getAccessToken()
					const endpoint = this.isReply
						? `${import.meta.env.VITE_SERVER_URL}/api/posts/${this.postId}/comments/${this.parentCommentId}/replies/${this.comment._id}`
						: `${import.meta.env.VITE_SERVER_URL}/api/posts/${this.postId}/comments/${this.comment._id}`

					await axios.delete(endpoint, {
						headers: { Authorization: `Bearer ${token}` },
					})

					this.$emit("reply-added") // Refresh the comments
				} catch (error) {
					console.error("Error deleting comment:", error)
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
