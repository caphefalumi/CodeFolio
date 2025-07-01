<template>
	<div>
		<v-container>
			<h1 class="text-h4 mb-6">Admin Dashboard</h1>
			<v-tabs v-model="tab">
				<v-tab>Users</v-tab>
				<v-tab>Posts</v-tab>
			</v-tabs>
			<v-tabs-items v-model="tab">
				<!-- Users Tab -->
				<v-tab-item>
					<div v-if="tab === 0">
						<v-row>
							<v-col cols="12">
								<v-btn color="primary" class="mb-4" @click="openUserDialog()"
									>Add User</v-btn
								>
								<v-text-field
									v-model="userSearch"
									label="Search users"
									prepend-inner-icon="mdi-magnify"
									variant="outlined"
									hide-details
									class="mb-4"
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
									editingUser ? "Edit User" : "Add User"
								}}</v-card-title>
								<v-card-text>
									<v-text-field
										v-model="userForm.email"
										label="Email"
										required
									></v-text-field>
									<v-text-field
										v-model="userForm.username"
										label="Username"
										required
									></v-text-field>
									<v-text-field
										v-model="userForm.firstName"
										label="First Name"
										required
									></v-text-field>
									<v-text-field
										v-model="userForm.lastName"
										label="Last Name"
										required
									></v-text-field>
									<v-text-field
										v-model="userForm.password"
										label="Password"
										:type="showPassword ? 'text' : 'password'"
										:append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
										@click:append="showPassword = !showPassword"
										:required="!editingUser"
									></v-text-field>
								</v-card-text>
								<v-card-actions>
									<v-btn color="primary" @click="saveUser">Save</v-btn>
									<v-btn text @click="closeUserDialog">Cancel</v-btn>
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
								<v-btn color="primary" class="mb-4" @click="openPostDialog()"
									>Add Post</v-btn
								>
								<v-text-field
									v-model="postSearch"
									label="Search posts"
									prepend-inner-icon="mdi-magnify"
									variant="outlined"
									hide-details
									class="mb-4"
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
									editingPost ? "Edit Post" : "Add Post"
								}}</v-card-title>
								<v-card-text>
									<v-text-field
										v-model="postForm.title"
										label="Title"
										required
									></v-text-field>
									<v-textarea
										v-model="postForm.description"
										label="Description"
									></v-textarea>
									<v-text-field
										v-model="postForm.githubUrl"
										label="GitHub URL"
									></v-text-field>
									<v-text-field
										v-model="postForm.type"
										label="Type"
									></v-text-field>
									<v-text-field
										v-model="postForm.tags"
										label="Tags (comma separated)"
									></v-text-field>
								</v-card-text>
								<v-card-actions>
									<v-btn color="primary" @click="savePost">Save</v-btn>
									<v-btn text @click="closePostDialog">Cancel</v-btn>
								</v-card-actions>
							</v-card>
						</v-dialog>
					</div>
				</v-tab-item>
			</v-tabs-items>
		</v-container>
	</div>
</template>

<script>
	import axios from "axios"

	export default {
		name: "AdminDashboard",
		data() {
			return {
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
				userHeaders: [
					{ text: "Email", value: "email" },
					{ text: "Username", value: "username" },
					{ text: "First Name", value: "firstName" },
					{ text: "Last Name", value: "lastName" },
					{ text: "Actions", value: "actions", sortable: false },
				],
				postHeaders: [
					{ text: "Title", value: "title" },
					{ text: "Type", value: "type" },
					{ text: "GitHub", value: "githubUrl" },
					{ text: "Actions", value: "actions", sortable: false },
				],
			}
		},
		computed: {
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
		},
		mounted() {
			this.fetchUsers()
			this.fetchPosts()
		},
		methods: {
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
						.put(
							`${import.meta.env.VITE_SERVER_URL}/api/users/${this.editingUser._id}`,
							this.userForm
						)
						.then(() => {
							this.fetchUsers()
							this.closeUserDialog()
						})
				} else {
					axios
						.post(`${import.meta.env.VITE_SERVER_URL}/api/users`, this.userForm)
						.then(() => {
							this.fetchUsers()
							this.closeUserDialog()
						})
				}
			},
			deleteUser(user) {
				if (confirm("Delete this user?")) {
					axios
						.delete(`${import.meta.env.VITE_SERVER_URL}/api/users/${user._id}`)
						.then(() => this.fetchUsers())
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
						.put(
							`${import.meta.env.VITE_SERVER_URL}/api/posts/${this.editingPost._id}`,
							this.postForm
						)
						.then(() => {
							this.fetchPosts()
							this.closePostDialog()
						})
				} else {
					axios
						.post(`${import.meta.env.VITE_SERVER_URL}/api/posts`, this.postForm)
						.then(() => {
							this.fetchPosts()
							this.closePostDialog()
						})
				}
			},
			deletePost(post) {
				if (confirm("Delete this post?")) {
					axios
						.delete(`${import.meta.env.VITE_SERVER_URL}/api/posts/${post._id}`)
						.then(() => this.fetchPosts())
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
