<template>
	<v-app>
		<v-app-bar app color="primary" dark role="banner" id="navigation">
			<v-app-bar-title>
				<router-link to="/" class="text-decoration-none text-white">
					CodeFolio
				</router-link>
			</v-app-bar-title>
			<v-spacer></v-spacer>
			<v-tooltip text="Switch theme" location="bottom">
				<template #activator="{ props }">
					<v-btn
						icon
						@click="toggleTheme"
						:aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
						v-bind="props"
					>
						<v-icon>{{
							isDark ? "mdi-weather-night" : "mdi-weather-sunny"
						}}</v-icon>
					</v-btn>
				</template>
			</v-tooltip>
			<v-tooltip text="Change language" location="bottom">
				<template #activator="{ props }">
					<language-switcher v-bind="props" />
				</template>
			</v-tooltip>
			<v-tooltip text="Home" location="bottom">
				<template #activator="{ props }">
					<v-btn to="/" text v-bind="props">{{ $t("navHome") }}</v-btn>
				</template>
			</v-tooltip>
			<v-tooltip text="Projects" location="bottom">
				<template #activator="{ props }">
					<v-btn to="/projects" text v-bind="props">{{ $t("navProjects") }}</v-btn>
				</template>
			</v-tooltip>
			<v-tooltip v-if="isAdmin" text="Admin" location="bottom">
				<template #activator="{ props }">
					<v-btn to="/admin" text v-bind="props">{{ $t("navAdmin") }}</v-btn>
				</template>
			</v-tooltip>
			<v-tooltip v-if="isAuthenticated" text="Notifications" location="bottom">
				<template #activator="{ props }">
					<v-btn
						icon
						@click="toggleNotifications"
						:aria-label="`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`"
						id="notification-trigger"
						v-bind="props"
					>
						<v-badge
							:content="unreadCount"
							:value="unreadCount > 0"
							color="error"
							overlap
						>
							<v-icon>mdi-bell{{ unreadCount > 0 ? "" : "-outline" }}</v-icon>
						</v-badge>
					</v-btn>
				</template>
			</v-tooltip>
			<v-menu v-if="isAuthenticated" offset-y>
				<template #activator="{ props }">
					<v-tooltip text="User menu" location="bottom">
						<template #activator="{ props: tooltipProps }">
							<v-btn icon v-bind="{...props, ...tooltipProps}" :aria-label="`User menu for ${username}`">
								<v-avatar size="32" v-if="avatar">
									<v-img
										:src="avatar"
										:alt="`${username} profile picture`"
										cover
									></v-img>
								</v-avatar>
								<v-avatar v-else size="32" class="bg-grey lighten-2"></v-avatar>
							</v-btn>
						</template>
					</v-tooltip>
				</template>
				<v-list role="menu">
					<v-list-item :to="`/${username}`" role="menuitem">
						<v-list-item-title>{{ $t("navProfile") }}</v-list-item-title>
					</v-list-item>
					<v-list-item @click="logout" role="menuitem">
						<v-list-item-title>{{ $t("navLogout") }}</v-list-item-title>
					</v-list-item>
				</v-list>
			</v-menu>
			<v-tooltip v-else text="Login" location="bottom">
				<template #activator="{ props }">
					<v-btn to="/login" text v-bind="props">{{ $t("navLogin") }}</v-btn>
				</template>
			</v-tooltip>
		</v-app-bar>

		<!-- Notification Dropdown Positioned Outside App Bar -->
		<notification-dropdown
			v-if="isAuthenticated"
			:show="showNotifications"
			@close="showNotifications = false"
			@update-unread-count="updateUnreadCount"
		/>

		<v-main role="main" id="main-content" tabindex="-1">
			<v-container>
				<router-view></router-view>
			</v-container>
		</v-main>
		<v-footer app color="primary" dark role="contentinfo">
			<v-row justify="center" no-gutters>
				<v-col class="text-center" cols="12">
					{{ new Date().getFullYear() }} — <strong>CodeFolio</strong>
				</v-col>
			</v-row>
		</v-footer>
	</v-app>
</template>

<script>
	import axios from "axios"
	import { fetchCurrentUser } from "@/composables/user.js"
	import NotificationDropdown from "@/components/NotificationDropdown.vue"
	import LanguageSwitcher from "@/components/LanguageSwitcher.vue"

	export default {
		name: "App",
		components: {
			NotificationDropdown,
			LanguageSwitcher,
		},
		data() {
			return {
				isAuthenticated: false,
				user: null,
				username: "",
				avatar: "",
				isDark: false,
				tokenRefreshInterval: null,
				showNotifications: false,
				unreadCount: 0,
			}
		},
		mounted() {
			this.fetchToken()
			this.loadThemePreference()
			this.loadUnreadCount()
		},
		computed: {
			isAdmin() {
				return this.user && this.user.email === import.meta.env.VITE_ADMIN_EMAIL
			},
		},
		methods: {
			async fetchProfile() {
				try {
					this.user = await fetchCurrentUser()
					this.username = this.user.username
					this.avatar = this.user.avatar

					console.log("User profile fetched:", this.avatar, this.username)
					this.loadUnreadCount()
				} catch (error) {
					console.error("Error fetching user profile:", error)
				}
			},

			fetchToken() {
				console.log("Checking for access token in sessionStorage...")
				const token = sessionStorage.getItem("accessToken")
				if (token) {
					axios
						.post(
							`${import.meta.env.VITE_SERVER_URL}/api/auth/validate`,
							{},
							{
								headers: { Authorization: `Bearer ${token}` },
							}
						)
						.then(response => {
							if (response.data.valid) {
								this.isAuthenticated = true
								this.fetchProfile()
								this.startTokenRefreshTimer()
								console.log("Token is valid:", token)
							} else {
								console.warn("Token is invalid, fetching new token...")
								this.getNewToken()
							}
						})
						.catch(error => {
							console.error("Error validating token:", error)
							this.getNewToken()
						})
					return
				} else {
					this.getNewToken()
				}
			},

			async getNewToken(silent = false) {
				try {
					const response = await axios.post(
						`${import.meta.env.VITE_SERVER_URL}/api/auth/token`,
						{},
						{ withCredentials: true }
					)
					const newToken = response.data.accessToken
					sessionStorage.setItem("accessToken", newToken)
					this.isAuthenticated = true
					if (!silent) {
						this.fetchToken()
					}
				} catch (error) {
					console.error("Error fetching new token:", error)
					sessionStorage.removeItem("accessToken")
					this.isAuthenticated = false
					this.user = null
					this.username = ""
					this.avatar = ""
				}
			},

			startTokenRefreshTimer() {
				this.stopTokenRefreshTimer()
				this.tokenRefreshInterval = setInterval(() => {
					console.log("Auto refreshing token...")
					this.getNewToken(true)
				}, 800000)
			},

			stopTokenRefreshTimer() {
				if (this.tokenRefreshInterval) {
					clearInterval(this.tokenRefreshInterval)
					this.tokenRefreshInterval = null
				}
			},

			toggleTheme() {
				this.isDark = !this.isDark
				this.$vuetify.theme.change(this.isDark ? "dark" : "light")
				localStorage.setItem("theme", this.isDark ? "dark" : "light")
			},

			loadThemePreference() {
				const savedTheme = localStorage.getItem("theme")
				if (!savedTheme) {
					this.isDark = false
					this.$vuetify.theme.change("light")
					localStorage.setItem("theme", "light")
					return
				}
				this.isDark = savedTheme === "dark"
				this.$vuetify.theme.change(this.isDark ? "dark" : "light")
			},
			logout() {
				axios
					.post(
						`${import.meta.env.VITE_SERVER_URL}/api/auth/logout`,
						{},
						{ withCredentials: true }
					)
					.finally(() => {
						sessionStorage.removeItem("accessToken")
						this.isAuthenticated = false
						this.user = null
						this.username = ""
						this.avatar = ""
						this.stopTokenRefreshTimer()
						this.showNotifications = false
						this.unreadCount = 0
						this.$router.push("/login")
					})
			},

			toggleNotifications() {
				this.showNotifications = !this.showNotifications
			},
			updateUnreadCount(count) {
				this.unreadCount = count
			},

			async loadUnreadCount() {
				if (!this.isAuthenticated) {
					this.unreadCount = 0
					return
				}

				try {
					const token = sessionStorage.getItem("accessToken")
					if (!token) return

					const response = await axios.get(
						`${import.meta.env.VITE_SERVER_URL}/api/notifications/unread-count`,
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					)
					this.unreadCount = response.data.unreadCount
				} catch (error) {
					console.error("Error loading unread count:", error)
					this.unreadCount = 0
				}
			},
		},

		watch: {
			$route() {
				this.fetchToken()
			},
		},
	}
</script>

<style>
	#app {
		font-family: "Roboto", sans-serif;
		-webkit-font-smoothing: antialiased;
	}
</style>
