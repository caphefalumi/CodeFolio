<template>
	<div class="mention-wrapper" ref="wrapperRef">
		<v-textarea
			ref="textareaRef"
			v-model="localValue"
			:label="label"
			:rows="rows"
			:variant="variant"
			:density="density"
			:hide-details="hideDetails"
			:disabled="disabled"
			:class="textareaClass"
			:maxlength="maxlength"
			:counter="counter"
			@input="handleInput"
			@keydown="handleKeydown"
			@click="handleClick"
		></v-textarea>

		<!-- Mention Dropdown -->
		<v-menu
			v-model="showMentions"
			:activator="menuActivator"
			:close-on-content-click="false"
			location="bottom start"
			max-width="300"
			:offset="[0, 5]"
		>
			<v-card v-if="mentionUsers.length > 0" class="mention-dropdown">
				<v-list density="compact">
					<v-list-item
						v-for="(user, index) in mentionUsers"
						:key="user._id"
						:class="{ 'bg-primary-lighten-5': index === selectedIndex }"
						@click="selectMention(user)"
						class="mention-item"
					>
						<template #prepend>
							<v-avatar size="24" class="mr-2">
								<v-img
									v-if="user.avatar"
									:src="user.avatar"
									:alt="`${user.username} avatar`"
								></v-img>
								<span v-else class="text-caption">
									{{ user.username.charAt(0).toUpperCase() }}
								</span>
							</v-avatar>
						</template>
						<v-list-item-title class="text-body-2">
							{{ user.username }}
						</v-list-item-title>
						<v-list-item-subtitle class="text-caption">
							{{ user.firstName }} {{ user.lastName }}
						</v-list-item-subtitle>
					</v-list-item>
				</v-list>
				<div v-if="loadingMentions || loadingAllUsers" class="pa-2 text-center">
					<v-progress-circular size="20" indeterminate></v-progress-circular>
					<div class="text-caption mt-1">
						{{ loadingAllUsers ? "Loading users..." : "Searching..." }}
					</div>
				</div>
			</v-card>
			<v-card
				v-else-if="mentionQuery && !loadingMentions && !loadingAllUsers"
				class="mention-dropdown"
			>
				<v-list>
					<v-list-item>
						<v-list-item-title class="text-caption text-grey">
							No users found for "{{ mentionQuery }}"
						</v-list-item-title>
					</v-list-item>
				</v-list>
			</v-card>
		</v-menu>
	</div>
</template>

<script>
	import axios from "axios"
	import { debounce } from "lodash-es"

	export default {
		name: "MentionTextarea",
		props: {
			modelValue: {
				type: String,
				default: "",
			},
			label: {
				type: String,
				default: "",
			},
			rows: {
				type: [String, Number],
				default: 3,
			},
			variant: {
				type: String,
				default: "outlined",
			},
			density: {
				type: String,
				default: "default",
			},
			hideDetails: {
				type: Boolean,
				default: false,
			},
			disabled: {
				type: Boolean,
				default: false,
			},
			textareaClass: {
				type: String,
				default: "",
			},
			maxlength: {
				type: [String, Number],
				default: undefined,
			},
			counter: {
				type: Boolean,
				default: false,
			},
		},
		emits: ["update:modelValue"],
		data() {
			return {
				localValue: this.modelValue,
				showMentions: false,
				mentionQuery: "",
				mentionUsers: [],
				allUsers: [], // Cache all users for filtering
				selectedIndex: 0,
				mentionStartPos: -1,
				loadingMentions: false,
				loadingAllUsers: false,
				menuActivator: null,
			}
		},
		watch: {
			modelValue(newVal) {
				this.localValue = newVal
			},
		},
		methods: {
			handleInput(event) {
				this.localValue = event.target.value
				this.$emit("update:modelValue", this.localValue)
				this.checkForMention()
			},

			handleKeydown(event) {
				if (this.showMentions) {
					switch (event.key) {
						case "ArrowDown":
							event.preventDefault()
							this.selectedIndex = Math.min(
								this.selectedIndex + 1,
								this.mentionUsers.length - 1
							)
							break
						case "ArrowUp":
							event.preventDefault()
							this.selectedIndex = Math.max(this.selectedIndex - 1, 0)
							break
						case "Enter":
							event.preventDefault()
							if (this.mentionUsers[this.selectedIndex]) {
								this.selectMention(this.mentionUsers[this.selectedIndex])
							}
							break
						case "Escape":
							event.preventDefault()
							this.closeMentions()
							break
					}
				}
			},

			handleClick() {
				this.checkForMention()
			},


			checkForMention() {
				const textarea = this.$refs.textareaRef.$el.querySelector("textarea")
				const cursorPos = textarea.selectionStart
				const text = this.localValue

				// Find the last @ before cursor position
				let atPos = -1
				for (let i = cursorPos - 1; i >= 0; i--) {
					if (text[i] === "@") {
						// Check if @ is at start or preceded by whitespace
						if (i === 0 || /\s/.test(text[i - 1])) {
							atPos = i
							break
						}
					} else if (/\s/.test(text[i])) {
						// Stop if we hit whitespace without finding @
						break
					}
				}

				if (atPos !== -1) {
					const query = text.substring(atPos + 1, cursorPos)
					// Only show mentions if query doesn't contain whitespace
					if (!/\s/.test(query)) {
						this.mentionStartPos = atPos
						this.mentionQuery = query
						this.searchUsers(query)
						this.showMentions = true
						this.updateMenuPosition(textarea, atPos)
					} else {
						this.closeMentions()
					}
				} else {
					this.closeMentions()
				}
			},

			updateMenuPosition(textarea) {
				// Update menu activator position for better dropdown placement
				this.menuActivator = textarea
			},
			searchUsers: debounce(async function (query) {
				if (query.length < 1) {
					this.mentionUsers = []
					return
				}

				// Load all users if not cached yet
				if (this.allUsers.length === 0 && !this.loadingAllUsers) {
					await this.loadAllUsers()
				}

				this.loadingMentions = true
				try {
					// Apply the same filtering logic as Projects.vue
					let filtered = this.allUsers

					if (query) {
						const searchQuery = query.toLowerCase()
						filtered = filtered.filter(user => {
							// Search in multiple fields like Projects.vue does
							return (
								user.username?.toLowerCase().includes(searchQuery) ||
								user.firstName?.toLowerCase().includes(searchQuery) ||
								user.lastName?.toLowerCase().includes(searchQuery) ||
								user.email?.toLowerCase().includes(searchQuery) ||
								// Search full name combination
								`${user.firstName || ""} ${user.lastName || ""}`
									.toLowerCase()
									.includes(searchQuery) ||
								// Search bio if available
								user.bio?.toLowerCase().includes(searchQuery)
							)
						})
					}

					// Sort results: exact username matches first, then alphabetical
					filtered.sort((a, b) => {
						const aUsername = a.username?.toLowerCase() || ""
						const bUsername = b.username?.toLowerCase() || ""
						const queryLower = query.toLowerCase()

						// Prioritize exact username matches
						if (aUsername === queryLower && bUsername !== queryLower) return -1
						if (bUsername === queryLower && aUsername !== queryLower) return 1

						// Then prioritize username starts with query
						if (
							aUsername.startsWith(queryLower) &&
							!bUsername.startsWith(queryLower)
						)
							return -1
						if (
							bUsername.startsWith(queryLower) &&
							!aUsername.startsWith(queryLower)
						)
							return 1

						// Finally sort alphabetically by username
						return aUsername.localeCompare(bUsername)
					})

					// Limit results to prevent overwhelming dropdown
					this.mentionUsers = filtered.slice(0, 10)
					this.selectedIndex = 0
				} catch (error) {
					console.error("Error filtering users:", error)
					this.mentionUsers = []
				} finally {
					this.loadingMentions = false
				}
			}, 300),

			async loadAllUsers() {
				this.loadingAllUsers = true
				try {
					const response = await axios.get(
						`${import.meta.env.VITE_SERVER_URL}/api/users`
					)
					this.allUsers = response.data || []
					console.log("Cached users for mentions:", this.allUsers.length)
				} catch (error) {
					console.error("Error loading all users:", error)
					this.allUsers = []
				} finally {
					this.loadingAllUsers = false
				}
			},

			selectMention(user) {
				const textarea = this.$refs.textareaRef.$el.querySelector("textarea")
				const cursorPos = textarea.selectionStart
				const beforeMention = this.localValue.substring(0, this.mentionStartPos)
				const afterMention = this.localValue.substring(cursorPos)

				// Insert mention with special formatting
				const mention = `@${user.username}`
				this.localValue = beforeMention + mention + afterMention
				this.$emit("update:modelValue", this.localValue)

				// Set cursor after mention
				this.$nextTick(() => {
					const newCursorPos = this.mentionStartPos + mention.length
					textarea.setSelectionRange(newCursorPos, newCursorPos)
					textarea.focus()
				})
				this.closeMentions()
			},

			closeMentions() {
				this.showMentions = false
				this.mentionQuery = ""
				this.mentionUsers = []
				this.selectedIndex = 0
				this.mentionStartPos = -1
			},
		},
		mounted() {
			// Preload users for faster mention search
			this.loadAllUsers()
		},
	}
</script>

<style scoped>
	.mention-wrapper {
		position: relative;
	}

	.mention-dropdown {
		max-height: 200px;
		overflow-y: auto;
	}

	.mention-item {
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.mention-item:hover {
		background-color: rgba(25, 118, 210, 0.08);
	}
</style>
