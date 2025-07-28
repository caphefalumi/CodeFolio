<template>
	<v-app>
		<v-app-bar app color="primary" dark role="banner" id="navigation">
			<v-app-bar-title id="tour-step-logo-brand">
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
						:aria-label="
							isDark ? 'Switch to light theme' : 'Switch to dark theme'
						"
						v-bind="props"
						id="tour-step-theme-toggle"
					>
						<v-icon>{{
							isDark ? "mdi-weather-night" : "mdi-weather-sunny"
						}}</v-icon>
					</v-btn>
				</template>
			</v-tooltip>

			<language-switcher />

			<v-tooltip text="Home" location="bottom">
				<template #activator="{ props }">
					<v-btn to="/" text v-bind="props" id="tour-step-home-nav">{{
						$t("navHome")
					}}</v-btn>
				</template>
			</v-tooltip>

			<v-tooltip text="Projects" location="bottom">
				<template #activator="{ props }">
					<v-btn
						to="/projects"
						text
						v-bind="props"
						id="tour-step-projects-nav"
						>{{ $t("navProjects") }}</v-btn
					>
				</template>
			</v-tooltip>

			<!-- Admin Button only visible on md and up -->
			<v-tooltip
				v-if="isAdmin && !$vuetify.display.smAndDown"
				text="Admin"
				location="bottom"
			>
				<template #activator="{ props }">
					<v-btn to="/admin" id="admin-nav" text v-bind="props">{{
						$t("navAdmin")
					}}</v-btn>
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

			<!-- User Menu -->
			<v-menu v-if="isAuthenticated" offset-y>
				<template #activator="{ props }">
					<v-tooltip text="User menu" location="bottom">
						<template #activator="{ props: tooltipProps }">
							<v-btn
								icon
								v-bind="{ ...props, ...tooltipProps }"
								id="tour-step-user-menu"
								:aria-label="`${username}`"
							>
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

					<!-- Admin menu item on small screens -->
					<v-list-item
						v-if="isAdmin && $vuetify.display.smAndDown"
						to="/admin"
						role="menuitem"
						id="admin-nav-small"
					>
						<v-list-item-title>{{ $t("navAdmin") }}</v-list-item-title>
					</v-list-item>

					<v-list-item @click="logout" role="menuitem">
						<v-list-item-title>{{ $t("navLogout") }}</v-list-item-title>
					</v-list-item>
				</v-list>
			</v-menu>

			<!-- Login button if not authenticated -->
			<v-tooltip v-else text="Login" location="bottom">
				<template #activator="{ props }">
					<v-btn to="/login" text v-bind="props" id="tour-step-login-button">{{
						$t("navLogin")
					}}</v-btn>
				</template>
			</v-tooltip>
		</v-app-bar>

		<!-- Notification Dropdown -->
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
				isInitialized: false, // Add flag to prevent repeated initialization
			}
		},
		async mounted() {
			await this.initializeApp()
		},
		computed: {
			isAdmin() {
				return (
					this.user &&
					(this.user.role === "admin" || this.user.role === "moderator")
				)
			},
		},
		methods: {
			// New method to handle app initialization
			async initializeApp() {
				if (this.isInitialized) return
				
				this.loadThemePreference()
				await this.fetchToken()
				this.isInitialized = true
			},

			async fetchProfile() {
				try {
					this.user = await fetchCurrentUser()
					this.username = this.user.username
					this.avatar = this.user.avatar
					this.loadUnreadCount()
				} catch (error) {
					console.error("Error fetching user profile:", error)
				}
			},

			async fetchToken() {
				const token = sessionStorage.getItem("accessToken")
				if (token) {
					try {
						const response = await axios.post(
							`${import.meta.env.VITE_SERVER_URL}/api/auth/validate`,
							{},
							{
								headers: { Authorization: `Bearer ${token}` },
							}
						)
						if (response.data.valid) {
							this.isAuthenticated = true
							await this.fetchProfile()
							this.startTokenRefreshTimer()
						} else {
							await this.getNewToken()
						}
					} catch (error) {
						await this.getNewToken()
					}
					return
				} else {
					await this.getNewToken()
				}
			},

			async getNewToken(silent = false) {
				try {
					const response = await axios.post(
						`${import.meta.env.VITE_SERVER_URL}/api/auth/refreshToken`,
						{},
						{ withCredentials: true }
					)
					const newToken = response.data.accessToken
					sessionStorage.setItem("accessToken", newToken)
					this.isAuthenticated = true
					if (!silent) {
						await this.fetchProfile()
						this.startTokenRefreshTimer()
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

			// Handle route changes more carefully
			handleRouteChange(to, from) {
				// Only refresh authentication state if we're moving to/from login/logout routes
				// or if the user authentication state might have changed
				const authRoutes = ['/login', '/logout', '/register']
				const isAuthRoute = authRoutes.includes(to.path) || authRoutes.includes(from.path)
				
				if (isAuthRoute && this.isInitialized) {
					// Only validate token, don't do full fetch
					this.validateCurrentToken()
				}
			},

			// New method to just validate without full refresh
			async validateCurrentToken() {
				const token = sessionStorage.getItem("accessToken")
				if (!token) {
					this.isAuthenticated = false
					return
				}

				try {
					const response = await axios.post(
						`${import.meta.env.VITE_SERVER_URL}/api/auth/validate`,
						{},
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					)
					this.isAuthenticated = response.data.valid
					if (!response.data.valid) {
						this.user = null
						this.username = ""
						this.avatar = ""
					}
				} catch (error) {
					this.isAuthenticated = false
					this.user = null
					this.username = ""
					this.avatar = ""
				}
			},
		},

		watch: {
			// Replace the problematic watch with a more controlled one
			$route: {
				handler(to, from) {
					this.handleRouteChange(to, from)
				},
				// Don't trigger on initial route
				immediate: false
			}
		},
	}
</script>

<style>
	#app {
		font-family: "Roboto", sans-serif;
		-webkit-font-smoothing: antialiased;
	}
</style>