<template>
	<div>
		<!-- Show NotFound if project doesn't exist -->
		<NotFound v-if="showNotFound" />

		<!-- Show main project content if project exists -->
		<v-container v-else>
			<v-row v-auto-animate>
				<!-- Project Header -->
				<v-col cols="12">
					<article>
						<v-card>
							<v-img
								:src="project.image"
								height="auto"
								max-height="400"
								style="
									object-fit: contain;
									width: 100%;
									max-width: 100%;
									max-height: 400px;
									background: #f5f5f5;
								"
								:alt="`${project.title} project cover image`"
							></v-img>
							<v-card-title class="text-h3 pa-0">
								<div class="project-title-responsive font-weight-bold">
									{{ project.title }}
								</div>
							</v-card-title>
							<v-card-subtitle>
								<span>By </span>
								<v-btn
									variant="text"
									color="primary"
									class="pa-1"
									style="
										text-transform: none;
										min-width: auto;
										height: auto;
										font-size: inherit;
										font-weight: normal;
									"
									@click="navigateToAuthorProfile"
									:disabled="!project.author"
								>
									{{ project.author }}
								</v-btn>
							</v-card-subtitle>
							<v-card-text>
								<p class="text-body-1 mb-4">{{ project.description }}</p>
								<div>
									<v-chip
										v-for="tag in project.tags"
										:key="tag"
										class="mr-2 mb-2"
										>{{ tag }}</v-chip
									>
								</div>
							</v-card-text>
							<v-card-actions class="justify-center align-center">
								<v-btn
									icon
									@click="upvoteProject"
									:disabled="project.upvoting"
									class="mr-2"
									:aria-label="$t('upvote')"
								>
									<v-icon
										:color="project.liked === true ? 'success' : 'grey'"
										aria-hidden="true"
										>mdi-arrow-up-bold</v-icon
									>
								</v-btn>
								<div
									class="text-h5 font-weight-bold mx-2"
									style="min-width: 32px; text-align: center"
									aria-live="polite"
								>
									{{ project.upvotes - project.downvotes }}
								</div>
								<v-btn
									icon
									@click="downvoteProject"
									:disabled="project.downvoting"
									class="ml-2"
									:aria-label="$t('downvote')"
								>
									<v-icon
										:color="project.liked === false ? 'error' : 'grey'"
										aria-hidden="true"
										>mdi-arrow-down-bold</v-icon
									>
								</v-btn>
								<v-spacer></v-spacer>
								<v-btn
									color="primary"
									variant="text"
									:href="project.githubUrl"
									target="_blank"
									prepend-icon="mdi-github"
									rel="noopener noreferrer"
									aria-label="View project on GitHub (opens in new tab)"
								>
									{{ $t("viewOnGitHub") }}
								</v-btn>
							</v-card-actions>
						</v-card>
					</article>
				</v-col>

				<!-- Project Content Section -->
				<v-col cols="12" v-if="project.content">
					<section aria-labelledby="project-content-heading">
						<v-card>
							<v-card-title>
								<h2 id="project-content-heading">
									{{ $t("projectContent") }}
								</h2>
							</v-card-title>
							<v-card-text>
								<div class="project-content" v-html="project.content"></div>
							</v-card-text>
						</v-card>
					</section>
				</v-col>

				<!-- GitHub Stats -->
				<v-col cols="12" md="6" v-if="project.githubUrl">
					<section aria-labelledby="github-stats-heading">
						<v-card>
							<v-card-title
								><h2 id="github-stats-heading">
									{{ $t("githubStats") }}
								</h2></v-card-title
							>
							<v-card-text>
								<v-row>
									<v-col cols="4">
										<div class="text-center">
											<div class="text-h4">{{ githubStats.stars }}</div>
											<div class="text-subtitle-1">{{ $t("stars") }}</div>
										</div>
									</v-col>
									<v-col cols="4">
										<div class="text-center">
											<div class="text-h4">{{ githubStats.forks }}</div>
											<div class="text-subtitle-1">{{ $t("forks") }}</div>
										</div>
									</v-col>
									<v-col cols="4">
										<div class="text-center">
											<div class="text-h4">{{ githubStats.issues }}</div>
											<div class="text-subtitle-1">{{ $t("issues") }}</div>
										</div>
									</v-col>
								</v-row>
							</v-card-text>
						</v-card>
					</section>
				</v-col>
				<!-- Project Details -->
				<v-col cols="12" md="6">
					<section aria-labelledby="project-details-heading">
						<v-card>
							<v-card-title
								><h2 id="project-details-heading">
									{{ $t("projectDetails") }}
								</h2></v-card-title
							>
							<v-card-text>
								<v-list>
									<v-list-item>
										<template v-slot:prepend>
											<v-icon aria-hidden="true">mdi-calendar</v-icon>
										</template>
										<v-list-item-title>{{ $t("created") }}</v-list-item-title>
										<v-list-item-subtitle>{{
											project.createdAt
										}}</v-list-item-subtitle>
									</v-list-item>
									<v-list-item>
										<template v-slot:prepend>
											<v-icon aria-hidden="true">mdi-update</v-icon>
										</template>
										<v-list-item-title>{{
											$t("lastUpdated")
										}}</v-list-item-title>
										<v-list-item-subtitle>{{
											project.updatedAt
										}}</v-list-item-subtitle>
									</v-list-item>
									<v-list-item>
										<template v-slot:prepend>
											<v-icon aria-hidden="true">mdi-eye</v-icon>
										</template>
										<v-list-item-title>{{ $t("views") }}</v-list-item-title>
										<v-list-item-subtitle>{{
											project.views
										}}</v-list-item-subtitle>
									</v-list-item>
								</v-list>
							</v-card-text>
						</v-card>
					</section>
				</v-col>
				<!-- Comments Section -->
				<v-col cols="12">
					<section aria-labelledby="comments-heading">
						<v-card>
							<v-card-title>
								<h2 id="comments-heading">{{ $t("comments") }}</h2>
							</v-card-title>
							<v-card-text>
								<app-alert
									v-if="errorMessage"
									type="error"
									:message="errorMessage"
									custom-class="mb-4"
								/>
								<app-form
									:loading="loading"
									:submit-button-text="$t('postComment')"
									:submit-button-disabled="
										!newComment.trim() || !isAuthenticated
									"
									@submit="handleCommentSubmit"
								>
									<mention-textarea
										v-model="newComment"
										:label="$t('addComment')"
										:rows="3"
										variant="outlined"
										:disabled="!isAuthenticated"
										maxlength="1000"
										counter
										@focus="handleCommentFocus"
									/>
								</app-form>
							</v-card-text>
							<v-list v-auto-animate aria-label="Project comments">
								<comment-item
									v-for="comment in comments"
									:key="comment._id"
									:comment="comment"
									:post-id="$route.params.id"
									@reply-added="fetchProjectDetail"
									class="mb-2"
								/>
								<div
									v-if="comments.length === 0"
									class="text-center text-grey py-8"
								>
									<v-icon size="48" class="mb-2">mdi-comment-outline</v-icon>
									<div>{{ $t("noCommentsYet") }}</div>
								</div>
							</v-list>
						</v-card>
					</section>
				</v-col>
			</v-row>
		</v-container>
		<v-alert
			v-if="showAuthBanner"
			type="warning"
			class="mb-4 fade-banner auth-banner-fixed"
			border="start"
			colored-border
			elevation="0"
			density="comfortable"
			style="
				background-color: #fffbe7;
				color: #b26a00;
				font-weight: 500;
				transition: opacity 1s;
				z-index: 9999;
			"
		>
			<template #prepend>
				<v-icon>mdi-account-alert</v-icon>
			</template>
			<div class="d-flex align-center justify-center">
				<span>{{ $t("loginToVote") }}</span>
			</div>
		</v-alert>
		<v-alert
			v-if="showCommentAuthAlert"
			type="warning"
			class="mb-4 fade-banner auth-banner-fixed"
			border="start"
			colored-border
			elevation="0"
			density="comfortable"
			style="
				background-color: #fffbe7;
				color: #b26a00;
				font-weight: 500;
				transition: opacity 1s;
				z-index: 9999;
			"
		>
			<template #prepend>
				<v-icon>mdi-account-alert</v-icon>
			</template>
			<div class="d-flex align-center justify-center">
				<span>{{ $t("loginToComment") }}</span>
			</div>
		</v-alert>
	</div>
</template>

<script>
	import axios from "axios"
	import { getAccessToken, isLoggedIn } from "@/composables/user.js"
	import { useApi } from "@/composables/common.js"
	import AppAlert from "@/components/AppAlert.vue"
	import AppForm from "@/components/AppForm.vue"
	import CommentItem from "@/components/CommentItem.vue"
	import MentionTextarea from "@/components/MentionTextarea.vue"
	import NotFound from "@/views/NotFound.vue"

	export default {
		name: "ProjectDetailView",
		components: {
			AppAlert,
			AppForm,
			CommentItem,
			MentionTextarea,
			NotFound,
		},
		setup() {
			const { getErrorMessage } = useApi()
			return { getErrorMessage }
		},
		data() {
			return {
				// Error state
				showNotFound: false,

				// Existing data
				project: {
					title: "",
					description: "",
					content: "",
					image: "",
					author: "",
					tags: [],
					githubUrl: "",
					createdAt: "",
					updatedAt: "",
					views: 0,
					upvotes: 0,
					downvotes: 0,
					liked: null,
					upvoting: false,
					downvoting: false,
				},
				githubStats: { stars: 0, forks: 0, issues: 0 },
				comments: [],
				newComment: "",
				errorMessage: "",
				showAuthBanner: false,
				showCommentAuthAlert: false,
				authBannerTimeout: null,
				commentAuthTimeout: null,
				loading: false,
			}
		},
		computed: {
			isAuthenticated() {
				return isLoggedIn()
			},
		},
		methods: {
			async fetchProjectDetail() {
				// Reset error state
				this.showNotFound = false

				try {
					const { username, id } = this.$route.params
					let headers = {}
					const token = getAccessToken && getAccessToken()
					if (token) headers.Authorization = `Bearer ${token}`
					const res = await axios.get(
						`${import.meta.env.VITE_SERVER_URL}/api/posts/${username}/${id}`,
						{
							headers,
						}
					)
					const post = res.data

					if (!post) {
						this.showNotFound = true
						return
					}
					console.log("PProject votes it ", post.liked)
					this.project = {
						title: post.title,
						description: post.description,
						content: post.content,
						image: post.coverImage,
						author: post.author.username,
						tags: post.tags || [],
						githubUrl: post.githubUrl,
						createdAt: new Date(post.createdAt).toLocaleDateString(),
						updatedAt: new Date(post.updatedAt).toLocaleDateString(),
						views: post.views,
						upvotes: post.upvotes || 0,
						downvotes: post.downvotes || 0,
						liked: post.liked !== undefined ? post.liked : null,
						upvoting: false,
						downvoting: false,
					}

					this.comments = (post.comments || []).map(c => ({
						_id: c._id,
						user: c.user, // This now includes username and avatar
						createdAt: c.createdAt,
						content: c.content,
						replies: (c.replies || []).map(r => ({
							_id: r._id,
							user: r.user, // This now includes username and avatar
							createdAt: r.createdAt,
							content: r.content,
						})),
					}))

					if (this.project.githubUrl) {
						this.fetchGitHubStats()
					}
				} catch (err) {
					console.error("Error fetching project detail:", err)
					// Check if it's a 404 error (project not found)
					if (err.response && err.response.status === 404) {
						this.showNotFound = true
					} else {
						// For other errors, still show NotFound to avoid broken page
						this.showNotFound = true
					}
				}
			},
			async fetchGitHubStats() {
				try {
					const apiUrl = this.project.githubUrl.replace(
						"https://github.com/",
						`https://api.github.com/repos/`
					)
					const res = await axios.get(apiUrl)
					const { stargazers_count, forks_count, open_issues_count } = res.data
					this.githubStats = {
						stars: stargazers_count,
						forks: forks_count,
						issues: open_issues_count,
					}
				} catch (err) {
					console.error("Error fetching GitHub stats:", err)
				}
			},
			handleCommentFocus() {
				if (!this.isAuthenticated) {
					this.showCommentAuthAlert = true
					clearTimeout(this.commentAuthTimeout)
					this.commentAuthTimeout = setTimeout(() => {
						this.showCommentAuthAlert = false
					}, 2000)
				}
			},
			handleCommentSubmit() {
				if (!this.isAuthenticated) {
					this.showCommentAuthAlert = true
					clearTimeout(this.commentAuthTimeout)
					this.commentAuthTimeout = setTimeout(() => {
						this.showCommentAuthAlert = false
					}, 2000)
					return
				}
				this.addComment()
			},
			navigateToAuthorProfile() {
				console.log("Navigating to author profile:", this.project.author)
				if (this.project.author) {
					const targetRoute = `/${this.project.author}`
					// Use router.push with force refresh if on same route
					this.$router.push(targetRoute).catch(() => {
						// If route is the same, force component reload by adding timestamp query
						this.$router.push({
							path: targetRoute,
							query: { t: Date.now() },
						})
					})
				} else {
					console.warn("No author information available")
				}
			},
			async addComment() {
				this.errorMessage = ""
				this.loading = true
				try {
					if (!this.newComment.trim()) return
					const token = getAccessToken()
					await axios.post(
						`${import.meta.env.VITE_SERVER_URL}/api/posts/${this.$route.params.id}/comments`,
						{ content: this.newComment },
						{ headers: { Authorization: `Bearer ${token}` } }
					)

					await this.fetchProjectDetail()
					this.newComment = ""
					this.showCommentAuthAlert = false
				} catch (error) {
					if (error.response && error.response.status === 401) {
						this.showCommentAuthAlert = true
						clearTimeout(this.commentAuthTimeout)
						this.commentAuthTimeout = setTimeout(() => {
							this.showCommentAuthAlert = false
						}, 2000)
					} else {
						this.errorMessage = this.getErrorMessage(
							error,
							"Failed to post comment. Please try again."
						)
					}
				} finally {
					this.loading = false
				}
			},
			async upvoteProject() {
				if (this.project.upvoting) return

				// Check authentication before making API call
				if (!this.isAuthenticated) {
					this.showAuthBanner = true
					clearTimeout(this.authBannerTimeout)
					this.authBannerTimeout = setTimeout(() => {
						this.showAuthBanner = false
					}, 2000)
					return
				}

				this.project.upvoting = true
				try {
					const token = getAccessToken()
					const res = await axios.post(
						`${import.meta.env.VITE_SERVER_URL}/api/posts/${this.$route.params.id}/upvote`,
						{},
						{ headers: { Authorization: `Bearer ${token}` } }
					)
					this.project.upvotes = res.data.upvotes
					this.project.downvotes = res.data.downvotes
					this.project.liked = res.data.liked
				} catch (error) {
					this.handleVoteError(error)
				} finally {
					this.project.upvoting = false
				}
			},
			async downvoteProject() {
				if (this.project.downvoting) return

				// Check authentication before making API call
				if (!this.isAuthenticated) {
					this.showAuthBanner = true
					clearTimeout(this.authBannerTimeout)
					this.authBannerTimeout = setTimeout(() => {
						this.showAuthBanner = false
					}, 2000)
					return
				}

				this.project.downvoting = true
				try {
					const token = getAccessToken()
					const res = await axios.post(
						`${import.meta.env.VITE_SERVER_URL}/api/posts/${this.$route.params.id}/downvote`,
						{},
						{ headers: { Authorization: `Bearer ${token}` } }
					)
					this.project.upvotes = res.data.upvotes
					this.project.downvotes = res.data.downvotes
					this.project.liked = res.data.liked
				} catch (error) {
					this.handleVoteError(error)
				} finally {
					this.project.downvoting = false
				}
			},
			handleVoteError(error) {
				if (error.response && error.response.status === 401) {
					this.showAuthBanner = true
					clearTimeout(this.authBannerTimeout)
					this.authBannerTimeout = setTimeout(() => {
						this.showAuthBanner = false
					}, 2000)
				} else {
					this.errorMessage = this.getErrorMessage(error, "Failed to vote.")
				}
			},
		},
		mounted() {
			this.fetchProjectDetail()
		},
		watch: {
			$route(to, from) {
				// When the route changes, reload the project data
				if (
					to.params.username !== from.params.username ||
					to.params.id !== from.params.id
				) {
					console.log(
						"Route changed, loading new project:",
						to.params.username,
						to.params.id
					)
					this.fetchProjectDetail()
				}
			},
		},
	}
</script>
<style scoped>
	.fade-banner {
		opacity: 1;
		transition: opacity 1s;
	}
	.fade-banner[style*="display: none"] {
		opacity: 0;
	}
	.auth-banner-fixed {
		position: fixed;
		top: 80px;
		left: 50%;
		transform: translateX(-50%);
		min-width: 320px;
		max-width: 90vw;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		pointer-events: none;
	}

	.project-content {
		line-height: 1.6;
		font-family: inherit;
	}

	.project-content h1,
	.project-content h2,
	.project-content h3 {
		margin-top: 1.5em;
		margin-bottom: 0.5em;
		font-weight: 600;
	}

	.project-content p {
		margin-bottom: 1em;
	}

	.project-content ul,
	.project-content ol {
		margin-bottom: 1em;
		padding-left: 1.5em;
	}

	.project-content blockquote {
		border-left: 4px solid #e0e0e0;
		padding-left: 1em;
		margin: 1em 0;
		font-style: italic;
		color: #666;
	}

	.project-content pre {
		background-color: #f5f5f5;
		padding: 1em;
		border-radius: 4px;
		overflow-x: auto;
		margin: 1em 0;
	}

	.project-content code {
		background-color: #f5f5f5;
		padding: 0.2em 0.4em;
		border-radius: 3px;
		font-family: "Courier New", monospace;
	}

	:deep(.project-content img) {
		max-width: 100% !important;
		height: auto !important;
		display: block;
		margin: 1.5em auto;
		object-fit: contain;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
		border-radius: 8px;
	}

	.project-title-responsive {
		padding-left: 2%;
		word-break: break-word;
		white-space: normal;
		overflow-wrap: break-word;
		max-width: 100%;
	}
</style>
