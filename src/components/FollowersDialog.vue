<template>
	<v-dialog v-model="dialog" max-width="600" scrollable>
		<v-card>
			<v-toolbar color="primary" dark>
				<v-toolbar-title>
					{{ title }}
				</v-toolbar-title>
				<v-spacer></v-spacer>
				<v-btn icon @click="close">
					<v-icon>mdi-close</v-icon>
				</v-btn>
			</v-toolbar>

			<v-card-text class="pa-0">
				<v-list v-if="users.length > 0">
					<v-list-item
						v-for="user in users"
						:key="user._id"
						:to="`/${user.username}`"
						@click="close"
					>
						<template #prepend>
							<v-avatar>
								<v-img
									v-if="user.avatar"
									:src="user.avatar"
									:alt="`${user.username} avatar`"
								></v-img>
								<v-icon v-else>mdi-account</v-icon>
							</v-avatar>
						</template>

						<v-list-item-title>
							{{ user.firstName }} {{ user.lastName }}
						</v-list-item-title>
						<v-list-item-subtitle> @{{ user.username }} </v-list-item-subtitle>

						<template #append>
							<follow-button
								v-if="user._id !== currentUserId"
								:user-id="user._id"
								:username="user.username"
								size="small"
								@follow-changed="handleFollowChanged"
							/>
						</template>
					</v-list-item>
				</v-list>

				<v-card-text v-else-if="!loading" class="text-center py-8">
					<v-icon size="64" color="grey">
						{{
							type === "followers" ? "mdi-account-group" : "mdi-account-heart"
						}}
					</v-icon>
					<h3 class="text-h6 mt-4 mb-2">
						{{
							type === "followers"
								? "No followers yet"
								: "Not following anyone yet"
						}}
					</h3>
					<p class="text-body-2 text-grey">
						{{
							type === "followers"
								? "When people follow this user, they will appear here."
								: "Users that this person follows will appear here."
						}}
					</p>
				</v-card-text>

				<v-card-text v-if="loading" class="text-center py-8">
					<v-progress-circular
						indeterminate
						color="primary"
					></v-progress-circular>
					<p class="mt-4">Loading {{ type }}...</p>
				</v-card-text>
			</v-card-text>
		</v-card>
	</v-dialog>
</template>

<script>
	import axios from "axios"
	import { getAccessToken, fetchCurrentUser } from "@/composables/user.js"
	import FollowButton from "./FollowButton.vue"

	export default {
		name: "FollowersDialog",
		components: {
			FollowButton,
		},
		props: {
			modelValue: {
				type: Boolean,
				default: false,
			},
			userId: {
				type: String,
				required: true,
			},
			type: {
				type: String,
				required: true,
				validator: value => ["followers", "following"].includes(value),
			},
		},
		emits: ["update:modelValue", "follow-changed"],
		data() {
			return {
				users: [],
				loading: false,
				currentUserId: null,
			}
		},
		computed: {
			dialog: {
				get() {
					return this.modelValue
				},
				set(value) {
					this.$emit("update:modelValue", value)
				},
			},
			title() {
				return this.type === "followers" ? "Followers" : "Following"
			},
		},
		watch: {
			dialog(newVal) {
				if (newVal) {
					this.fetchUsers()
					this.getCurrentUser()
				}
			},
		},
		methods: {
			async getCurrentUser() {
				try {
					const user = await fetchCurrentUser()
					this.currentUserId = user?._id
				} catch (error) {
					this.currentUserId = null
				}
			},
			async fetchUsers() {
				this.loading = true
				try {
					const endpoint = this.type === "followers" ? "followers" : "following"
					const response = await axios.get(
						`${import.meta.env.VITE_SERVER_URL}/api/users/${this.userId}/${endpoint}`
					)
					this.users = response.data[this.type] || []
				} catch (error) {
					console.error(`Error fetching ${this.type}:`, error)
					this.users = []
				} finally {
					this.loading = false
				}
			},

			handleFollowChanged(data) {
				this.$emit("follow-changed", data)
			},

			close() {
				this.dialog = false
			},
		},
	}
</script>
