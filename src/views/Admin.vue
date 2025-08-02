<template>
	<div>
		<!-- Show NotFound for unauthorized users -->
		<NotFound v-if="showNotFound" />

		<!-- Show loading spinner while checking authentication -->

		<!-- Show admin dashboard for authorized users -->
		<v-container v-else>
			<h1 class="text-h4 mb-6">{{ $t("adminTitle") }}</h1>
			<v-tabs v-model="tab" @update:model-value="onTabChange" id="admin-tabs">
				<v-tab id="admin-tab-users" v-if="currentUserRole === 'admin'">
					{{ $t("adminUsers") }}
				</v-tab>
				<v-tab id="admin-tab-posts">{{ $t("adminPosts") }}</v-tab>
				<v-tab id="admin-tab-analytics" v-if="currentUserRole === 'admin'">{{
					$t("adminAnalytics")
				}}</v-tab>
			</v-tabs>

			<!-- Users Tab -->
			<div v-if="tab === 0 && currentUserRole === 'admin'">
				<v-row>
					<v-col cols="12">
						<v-btn
							id="tour-step-admin-nav"
							color="primary"
							class="mb-4"
							@click="openUserDialog()"
							:disabled="currentUserRole !== 'admin'"
						>
							{{ $t("addUser") }}
						</v-btn>
						<v-text-field
							v-model="userSearch"
							:label="$t('searchUsers')"
							prepend-inner-icon="mdi-magnify"
							variant="outlined"
							hide-details
							class="mb-4"
							maxlength="100"
						/>
						<v-skeleton-loader
							v-if="users.length === 0 && !showNotFound"
							type="table"
							:loading="users.length === 0"
							class="mb-4"
						/>
						<v-data-table
							v-else
							:headers="userHeaders"
							:items="filteredUsers"
							item-key="_id"
							class="elevation-1"
							:items-per-page="10"
							aria-label="User list"
							role="table"
						>
							<template #item.actions="{ item }">
								<v-btn
									icon
									@click="editUser(item)"
									:aria-label="$t('editUser')"
									:disabled="currentUserRole !== 'admin'"
								>
									<v-icon>mdi-pencil</v-icon>
								</v-btn>
								<v-btn
									icon
									@click="deleteUser(item)"
									:aria-label="$t('deleteUser')"
									:disabled="currentUserRole !== 'admin'"
								>
									<v-icon>mdi-delete</v-icon>
								</v-btn>
							</template>
						</v-data-table>
					</v-col>
				</v-row>
				<v-dialog v-model="userDialog" max-width="500px">
					<v-card>
						<v-card-title>{{
							editingUser ? $t("editUser") : $t("addUser")
						}}</v-card-title>
						<v-card-text>
							<v-text-field
								v-model="userForm.email"
								:label="$t('email')"
								required
								maxlength="255"
							></v-text-field>
							<v-text-field
								v-model="userForm.username"
								:label="$t('username')"
								required
								maxlength="50"
							></v-text-field>
							<v-text-field
								v-model="userForm.firstName"
								:label="$t('firstName')"
								required
								maxlength="50"
							></v-text-field>
							<v-text-field
								v-model="userForm.lastName"
								:label="$t('lastName')"
								required
								maxlength="50"
							></v-text-field>
							<v-select
								v-model="userForm.role"
								:label="$t('role')"
								:items="['user', 'moderator', 'admin']"
								:disabled="!canEditRole()"
								:rules="[value => value !== '' || $t('roleRequired')]"
								hide-details
								class="mt-4"
							></v-select>
						</v-card-text>
						<v-card-actions>
							<v-btn color="primary" @click="saveUser">{{ $t("save") }}</v-btn>
							<v-btn text @click="closeUserDialog">{{ $t("cancel") }}</v-btn>
						</v-card-actions>
					</v-card>
				</v-dialog>
			</div>

			<!-- Posts Tab -->
			<div
				v-else-if="
					(tab === 0 && currentUserRole === 'moderator') ||
					(tab === 1 && currentUserRole === 'admin')
				"
			>
				<v-row>
					<v-col cols="12">
						<v-btn color="primary" class="mb-4" @click="openPostDialog()">{{
							$t("addPost")
						}}</v-btn>
						<v-text-field
							v-model="postSearch"
							:label="$t('searchPosts')"
							prepend-inner-icon="mdi-magnify"
							variant="outlined"
							hide-details
							class="mb-4"
							maxlength="100"
						/>
						<v-skeleton-loader
							v-if="posts.length === 0 && !showNotFound"
							type="table"
							:loading="posts.length === 0"
							class="mb-4"
						/>
						<v-data-table
							v-else
							:headers="postHeaders"
							:items="filteredPosts"
							item-key="_id"
							class="elevation-1"
							:items-per-page="10"
							aria-label="Post list"
							role="table"
						>
							<template #item.actions="{ item }">
								<v-btn icon @click="editPost(item)" :aria-label="$t('editPost')"
									><v-icon>mdi-pencil</v-icon></v-btn
								>
								<v-btn
									icon
									@click="deletePost(item)"
									:aria-label="$t('deletePost')"
									><v-icon>mdi-delete</v-icon></v-btn
								>
							</template>
						</v-data-table>
					</v-col>
				</v-row>
				<v-dialog v-model="postDialog" max-width="800px">
					<ProjectDialog
						:modelValue="postDialog"
						:project="editingPost ? editingPost : null"
						:loading="false"
						:showGithubImport="false"
						@update:modelValue="postDialog = $event"
						@save="handleProjectDialogSave"
						@close="closePostDialog"
					/>
				</v-dialog>
			</div>

			<!-- Analytics Tab -->
			<div v-else-if="tab === 2 && currentUserRole === 'admin'">
				<StatisticsView />
			</div>
		</v-container>
	</div>
</template>

<script>
	import axios from "axios"
	import { getAccessToken, fetchCurrentUser } from "@/composables/user.js"
	import NotFound from "@/views/NotFound.vue"
	import StatisticsView from "@/components/Statistics.vue"
	import ProjectDialog from "@/components/ProjectDialog.vue"
	export default {
		name: "AdminDashboard",
		components: {
			NotFound,
			StatisticsView,
			ProjectDialog,
		},
		data() {
			return {
				showNotFound: false,

				// Existing data
				tab: 0,
				users: [],
				posts: [],
				userDialog: false,
				postDialog: false,
				editingUser: null,
				editingPost: null,
				currentUser: null,
				userForm: {
					email: "",
					username: "",
					firstName: "",
					lastName: "",
					role: "",
				},
				postForm: {
					title: "",
					description: "",
					githubUrl: "",
					type: "",
					tags: "",
				},
				showPassword: false,
				userSearch: "",
				postSearch: "",
				currentUserId: null, // Track current user ID
				currentUserRole: null, // Track current user role
			}
		},
		computed: {
			userHeaders() {
				return [
					{ text: this.$t("email"), value: "email" },
					{ text: this.$t("username"), value: "username" },
					{ text: this.$t("firstName"), value: "firstName" },
					{ text: this.$t("lastName"), value: "lastName" },
					{ text: this.$t("role"), value: "role" },
					{ text: this.$t("actions"), value: "actions", sortable: false },
				]
			},
			postHeaders() {
				return [
					{ text: this.$t("title"), value: "title" },
					{ text: this.$t("type"), value: "type" },
					{ text: this.$t("github"), value: "githubUrl" },
					{ text: this.$t("actions"), value: "actions", sortable: false },
				]
			},
			filteredUsers() {
				if (!this.userSearch) return this.users
				const q = this.userSearch.toLowerCase()
				return this.users.filter(
					u =>
						u.email?.toLowerCase().includes(q) ||
						u.username?.toLowerCase().includes(q) ||
						u.firstName?.toLowerCase().includes(q) ||
						u.lastName?.toLowerCase().includes(q)
				)
			},

			filteredPosts() {
				if (!this.postSearch) return this.posts
				const q = this.postSearch.toLowerCase()
				return this.posts.filter(
					p =>
						p.title?.toLowerCase().includes(q) ||
						p.description?.toLowerCase().includes(q) ||
						p.githubUrl?.toLowerCase().includes(q) ||
						(Array.isArray(p.tags)
							? p.tags.join(",").toLowerCase().includes(q)
							: false)
				)
			},
			authHeaders() {
				const token = getAccessToken()
				return token ? { Authorization: `Bearer ${token}` } : {}
			},
		},
		watch: {
			"$route.query.tab"() {
				this.initializeTabFromUrl()
			},
		},
		async mounted() {
			// Initialize tab from URL query parameter
			await this.checkAdminAccess()
		},
		methods: {
			initializeTabFromUrl() {
				const tabParam = this.$route.query.tab
				const isAdmin = this.currentUserRole === "admin"
				const isModerator = this.currentUserRole === "moderator"
				const tabMapAdmin = { users: 0, posts: 1, analytics: 2 }
				const tabMapModerator = { posts: 0 }

				if (isAdmin) {
					if (tabParam && tabMapAdmin.hasOwnProperty(tabParam)) {
						this.tab = tabMapAdmin[tabParam]
					} else {
						this.tab = 0
						if (!tabParam) {
							this.$router.replace({
								path: this.$route.path,
								query: { ...this.$route.query, tab: "users" },
							})
						}
					}
				} else if (isModerator) {
					// Moderators can only see posts tab
					this.tab = 0
					if (tabParam !== "posts") {
						this.$router.replace({
							path: this.$route.path,
							query: { ...this.$route.query, tab: "posts" },
						})
					}
				}
			},

			onTabChange(newTab) {
				const tabNames = ["users", "posts", "analytics"]
				const tabName = tabNames[newTab] || "users"

				this.$router.push({
					path: this.$route.path,
					query: { ...this.$route.query, tab: tabName },
				})
			},
			async checkAdminAccess() {
				const isAuthenticated = getAccessToken()

				if (!isAuthenticated) {
					this.showNotFound = true
					return
				}

				try {
					this.currentUser = await fetchCurrentUser()

					if (!this.currentUser) {
						this.showNotFound = true
						return
					}

					this.currentUserId = this.currentUser._id
					this.currentUserRole = this.currentUser.role

					const isAdmin = this.currentUser.role === "admin"
					const isModerator = this.currentUser.role === "moderator"

					if (isAdmin || isModerator) {
						if (isAdmin) this.fetchUsers()
						this.fetchPosts()
						this.initializeTabFromUrl()
					} else {
						this.showNotFound = true
					}
				} catch (error) {
					console.error("Error checking admin access:", error)
					this.showNotFound = true
				}
			},
			fetchUsers() {
				axios
					.get(`${import.meta.env.VITE_SERVER_URL}/api/users`, {
						headers: this.authHeaders,
					})
					.then(res => {
						this.users = res.data
					})
					.catch(() => {})
			},
			fetchPosts() {
				axios
					.get(`${import.meta.env.VITE_SERVER_URL}/api/posts`)
					.then(res => {
						this.posts = res.data
					})
					.catch(() => {})
			},
			openUserDialog() {
				const currentUser = this.users.find(u => u._id === this.currentUserId)
				if (!currentUser || currentUser.role !== "admin") return // Only admin can open
				this.editingUser = null
				this.userForm = {
					email: "",
					username: "",
					firstName: "",
					lastName: "",
					role: "",
				}
				this.userDialog = true
			},
			editUser(user) {
				if (!this.currentUser || this.currentUser.role !== "admin") return
				this.editingUser = user
				this.userForm = user
				this.userDialog = true
			},
			saveUser() {
				if (!this.currentUser || this.currentUser.role !== "admin") return
				if (this.editingUser) {
					axios
						.patch(
							`${import.meta.env.VITE_SERVER_URL}/api/users/${this.editingUser._id}`,
							this.userForm,
							{ headers: this.authHeaders }
						)
						.then(() => {
							this.fetchUsers()
							this.closeUserDialog()
						})
						.catch(error => {
							console.error("Error updating user:", error)
						})
				} else {
					axios
						.post(
							`${import.meta.env.VITE_SERVER_URL}/api/users`,
							this.userForm,
							{ headers: this.authHeaders }
						)
						.then(() => {
							this.fetchUsers()
							this.closeUserDialog()
						})
						.catch(error => {
							console.error("Error creating user:", error)
						})
				}
			},
			deleteUser(user) {
				if (!this.currentUser || this.currentUser.role !== "admin") return // Only admin can delete
				if (confirm(this.$t("deleteUser"))) {
					axios
						.delete(
							`${import.meta.env.VITE_SERVER_URL}/api/users/${user._id}`,
							{ headers: this.authHeaders }
						)
						.then(() => this.fetchUsers())
						.catch(error => {
							console.error("Error deleting user:", error)
						})
				}
			},
			closeUserDialog() {
				this.userDialog = false
			},
			openPostDialog() {
				this.editingPost = null
				this.postForm = {
					title: "",
					description: "",
					githubUrl: "",
					type: "",
					tags: "",
				}
				this.postDialog = true
			},
			editPost(post) {
				this.editingPost = post
				this.postForm = { ...post }
				this.postDialog = true
			},
			handleProjectDialogSave(projectData) {
				// If editing, update post; else, create new post
				if (this.editingPost) {
					this.savePostWithData(projectData)
				} else {
					this.savePostWithData(projectData)
				}
			},
			savePostWithData(data) {
				if (this.editingPost) {
					// PATCH update
					this.$axios
						.patch(
							`${import.meta.env.VITE_SERVER_URL}/api/posts/${this.editingPost._id}`,
							data,
							{ headers: this.authHeaders }
						)
						.then(() => {
							this.fetchPosts()
							this.closePostDialog()
						})
						.catch(error => {
							console.error("Error updating post:", error)
						})
				} else {
					// POST create
					this.$axios
						.post(
							`${import.meta.env.VITE_SERVER_URL}/api/posts`,
							data,
							{ headers: this.authHeaders }
						)
						.then(() => {
							this.fetchPosts()
							this.closePostDialog()
						})
						.catch(error => {
							console.error("Error creating post:", error)
						})
				}
			},
			deletePost(post) {
				if (confirm(this.$t("deletePost"))) {
					axios
						.delete(
							`${import.meta.env.VITE_SERVER_URL}/api/posts/${post._id}`,
							{ headers: this.authHeaders }
						)
						.then(() => this.fetchPosts())
						.catch(error => {
							console.error("Error deleting post:", error)
						})
				}
			},
			closePostDialog() {
				this.postDialog = false
			},
			canEditRole() {
				// Only admin can edit roles
				return this.currentUser && this.currentUser.role === "admin"
			},
			isRoleChangeDisabled() {
				return !(this.currentUser && this.currentUser.role === "admin")
			},
			async changeUserRole(user) {
				try {
					await axios.patch(
						`${import.meta.env.VITE_SERVER_URL}/api/users/${user._id}`,
						{ role: user.role },
						{ headers: this.authHeaders }
					)
					this.fetchUsers()
				} catch (error) {
					console.error("Error changing user role:", error)
				}
			},
		},
	}
</script>

<style scoped>
	.v-data-table {
		margin-bottom: 2rem;
	}
</style>
