<template>
	<div>
		<!-- Show NotFound for unauthorized users -->
		<NotFound v-if="showNotFound" />

		<!-- Show loading spinner while checking authentication -->
		<v-container v-else-if="isLoading" class="text-center">
			<v-progress-circular indeterminate size="64" />
			<p class="mt-4">{{ $t("loading") || "Loading..." }}</p>
		</v-container>

		<!-- Show admin dashboard for authorized users -->
		<v-container v-else>
			<h1 class="text-h4 mb-6">{{ $t("adminTitle") }}</h1>
			<v-tabs v-model="tab">
				<v-tab>{{ $t("adminUsers") }}</v-tab>
				<v-tab>{{ $t("adminPosts") }}</v-tab>
				<v-tab>{{ $t("adminAnalytics") }}</v-tab>
			</v-tabs>
			<v-tabs-items v-model="tab">
				<!-- Users Tab -->
				<v-tab-item>
					<div v-if="tab === 0">
						<v-row>
							<v-col cols="12">
								<v-btn color="primary" class="mb-4" @click="openUserDialog()">{{
									$t("addUser")
								}}</v-btn>
								<v-text-field
									v-model="userSearch"
									:label="$t('searchUsers')"
									prepend-inner-icon="mdi-magnify"
									variant="outlined"
									hide-details
									class="mb-4"
									maxlength="100"
								/>
								<v-data-table
									:headers="userHeaders"
									:items="filteredUsers"
									item-key="_id"
									class="elevation-1"
									:items-per-page="10"
								>
									<template #item.actions="{ item }">
										<v-btn icon @click="editUser(item)"
											><v-icon>mdi-pencil</v-icon></v-btn
										>
										<v-btn icon @click="deleteUser(item)"
											><v-icon>mdi-delete</v-icon></v-btn
										>
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
									<v-text-field
										v-model="userForm.password"
										:label="$t('password')"
										:type="showPassword ? 'text' : 'password'"
										:append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
										@click:append="showPassword = !showPassword"
										:required="!editingUser"
										maxlength="128"
									></v-text-field>
								</v-card-text>
								<v-card-actions>
									<v-btn color="primary" @click="saveUser">{{
										$t("save")
									}}</v-btn>
									<v-btn text @click="closeUserDialog">{{
										$t("cancel")
									}}</v-btn>
								</v-card-actions>
							</v-card>
						</v-dialog>
					</div>
				</v-tab-item>
				<!-- Posts Tab -->
				<v-tab-item>
					<div v-if="tab === 1">
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
								<v-data-table
									:headers="postHeaders"
									:items="filteredPosts"
									item-key="_id"
									class="elevation-1"
									:items-per-page="10"
								>
									<template #item.actions="{ item }">
										<v-btn icon @click="editPost(item)"
											><v-icon>mdi-pencil</v-icon></v-btn
										>
										<v-btn icon @click="deletePost(item)"
											><v-icon>mdi-delete</v-icon></v-btn
										>
									</template>
								</v-data-table>
							</v-col>
						</v-row>
						<v-dialog v-model="postDialog" max-width="600px">
							<v-card>
								<v-card-title>{{
									editingPost ? $t("editPost") : $t("addPost")
								}}</v-card-title>
								<v-card-text>
									<v-text-field
										v-model="postForm.title"
										:label="$t('title')"
										required
										maxlength="100"
										counter
									></v-text-field>
									<v-textarea
										v-model="postForm.description"
										:label="$t('description')"
										maxlength="500"
										counter
									></v-textarea>
									<v-text-field
										v-model="postForm.githubUrl"
										:label="$t('githubUrl')"
										maxlength="255"
									></v-text-field>
									<v-text-field
										v-model="postForm.type"
										:label="$t('type')"
										maxlength="50"
									></v-text-field>
									<v-text-field
										v-model="postForm.tags"
										:label="$t('tagsCommaSeparated')"
										maxlength="200"
									></v-text-field>
								</v-card-text>
								<v-card-actions>
									<v-btn color="primary" @click="savePost">{{
										$t("save")
									}}</v-btn>
									<v-btn text @click="closePostDialog">{{
										$t("cancel")
									}}</v-btn>
								</v-card-actions>
							</v-card>
						</v-dialog>
					</div>
				</v-tab-item>
				<v-tab-item>
					<div v-if="tab === 2">
						<Statistics-View />
					</div>
				</v-tab-item>
			</v-tabs-items>
		</v-container>
	</div>
</template>

<script>
	import axios from "axios"
	import { getAccessToken, fetchCurrentUser } from "@/composables/user.js"
	import NotFound from "@/views/NotFound.vue"
	import StatisticsView from "@/components/Statistics.vue"
	export default {
		name: "AdminDashboard",
		components: {
			NotFound,
			StatisticsView,
		},
		data() {
			return {
				// Authentication state
				isLoading: true,
				showNotFound: false,

				// Existing data
				tab: 0,
				users: [],
				posts: [],
				userDialog: false,
				postDialog: false,
				editingUser: null,
				editingPost: null,
				userForm: {
					email: "",
					username: "",
					firstName: "",
					lastName: "",
					password: "",
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
			}
		},
		computed: {
			userHeaders() {
				return [
					{ text: this.$t("email"), value: "email" },
					{ text: this.$t("username"), value: "username" },
					{ text: this.$t("firstName"), value: "firstName" },
					{ text: this.$t("lastName"), value: "lastName" },
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
		async mounted() {
			await this.checkAdminAccess()
		},
		methods: {
			async checkAdminAccess() {
				const isAuthenticated = getAccessToken()

				if (!isAuthenticated) {
					this.showNotFound = true
					this.isLoading = false
					return
				}

				try {
					const currentUser = await fetchCurrentUser()

					if (!currentUser) {
						this.showNotFound = true
						this.isLoading = false
						return
					}

					const isAdmin = currentUser.email === import.meta.env.VITE_ADMIN_EMAIL

					if (isAdmin) {
						this.isLoading = false
						// Load admin data
						this.fetchUsers()
						this.fetchPosts()
					} else {
						this.showNotFound = true
						this.isLoading = false
					}
				} catch (error) {
					console.error("Error checking admin access:", error)
					this.showNotFound = true
					this.isLoading = false
				}
			},
			fetchUsers() {
				axios
					.get(`${import.meta.env.VITE_SERVER_URL}/api/users`)
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
				this.editingUser = null
				this.userForm = {
					email: "",
					username: "",
					firstName: "",
					lastName: "",
					password: "",
				}
				this.userDialog = true
			},
			editUser(user) {
				this.editingUser = user
				this.userForm = { ...user, password: "" }
				this.userDialog = true
			},
			saveUser() {
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
			savePost() {
				if (this.editingPost) {
					axios
						.patch(
							`${import.meta.env.VITE_SERVER_URL}/api/posts/${this.editingPost._id}`,
							this.postForm,
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
					axios
						.post(
							`${import.meta.env.VITE_SERVER_URL}/api/posts`,
							this.postForm,
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
		},
	}
</script>

<style scoped>
	.v-data-table {
		margin-bottom: 2rem;
	}
</style>
