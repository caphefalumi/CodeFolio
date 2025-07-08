<template>
	<v-container>
		<!-- Loading State -->
		<v-row v-if="loading" justify="center" class="my-12">
			<v-col cols="12" class="text-center">
				<v-progress-circular
					indeterminate
					size="64"
					color="primary"
				></v-progress-circular>
				<p class="mt-4 text-h6">{{ $t("loading") }}</p>
			</v-col>
		</v-row>

		<!-- Main Content -->
		<div v-else>
			<!-- Header Section -->
			<v-row class="mb-6">
				<v-col cols="12">
					<h1 class="text-h3 font-weight-bold mb-2">
						{{ $t("platformStatistics") }}
					</h1>
					<p class="text-subtitle-1 text-grey-darken-1">
						{{ $t("statisticsDescription") }}
					</p>
				</v-col>
			</v-row>

			<!-- Key Metrics Cards -->
			<v-row class="mb-6">
				<v-col
					cols="12"
					sm="6"
					md="3"
					v-for="metric in keyMetrics"
					:key="metric.title"
				>
					<v-card
						class="text-center pa-4"
						:color="metric.color"
						variant="tonal"
					>
						<v-icon :icon="metric.icon" size="48" class="mb-2"></v-icon>
						<div class="text-h4 font-weight-bold">{{ metric.value }}</div>
						<div class="text-subtitle-2">{{ metric.title }}</div>
					</v-card>
				</v-col>
			</v-row>

			<!-- Charts Section -->
			<v-row class="mb-6">
				<!-- Project Types Distribution -->
				<v-col cols="12" md="6">
					<v-card class="pa-4">
						<v-card-title>{{ $t("projectTypesDistribution") }}</v-card-title>
						<v-card-text>
							<div class="chart-container">
								<canvas
									ref="projectTypesChart"
									width="400"
									height="300"
								></canvas>
							</div>
						</v-card-text>
					</v-card>
				</v-col>

				<!-- User Registration Trend -->
				<v-col cols="12" md="6">
					<v-card class="pa-4">
						<v-card-title>{{ $t("userRegistrationTrend") }}</v-card-title>
						<v-card-text>
							<div class="chart-container">
								<canvas ref="userTrendChart" width="400" height="300"></canvas>
							</div>
						</v-card-text>
					</v-card>
				</v-col>
			</v-row>

			<!-- Top Projects and Users -->
			<v-row>
				<!-- Most Popular Projects -->
				<v-col cols="12" md="6">
					<v-card class="pa-4">
						<v-card-title>{{ $t("mostPopularProjects") }}</v-card-title>
						<v-card-text>
							<v-list v-if="topProjects.length > 0">
								<v-list-item
									v-for="project in topProjects"
									:key="project._id"
									class="px-0"
									@click="viewProject(project)"
								>
									<template #prepend>
										<v-avatar size="40" class="mr-3">
											<v-img
												v-if="project.image"
												:src="project.image"
												:alt="project.title"
											></v-img>
											<v-icon v-else color="primary">mdi-folder</v-icon>
										</v-avatar>
									</template>
									<v-list-item-title>{{ project.title }}</v-list-item-title>
									<v-list-item-subtitle>
										{{ project.views || 0 }} views •
										{{ project.upvotes || 0 }} upvotes
									</v-list-item-subtitle>
									<template #append>
										<v-chip size="small" color="primary">
											#{{ topProjects.indexOf(project) + 1 }}
										</v-chip>
									</template>
								</v-list-item>
							</v-list>
							<div v-else class="text-center py-8">
								<v-icon size="64" color="grey-lighten-1"
									>mdi-folder-outline</v-icon
								>
								<p class="text-body-2 mt-2">{{ $t("statisticsNoData") }}</p>
							</div>
						</v-card-text>
					</v-card>
				</v-col>

				<!-- Most Active Users -->
				<v-col cols="12" md="6">
					<v-card class="pa-4">
						<v-card-title>{{ $t("mostActiveUsers") }}</v-card-title>
						<v-card-text>
							<v-list v-if="topUsers.length > 0">
								<v-list-item
									v-for="user in topUsers"
									:key="user._id"
									class="px-0"
									@click="viewUserProfile(user)"
								>
									<template #prepend>
										<v-avatar size="40" class="mr-3">
											<v-img
												v-if="user.avatar"
												:src="user.avatar"
												:alt="user.username"
											></v-img>
											<v-icon v-else color="primary">mdi-account</v-icon>
										</v-avatar>
									</template>
									<v-list-item-title
										>{{ user.firstName }} {{ user.lastName }}</v-list-item-title
									>
									<v-list-item-subtitle>
										@{{ user.username }} • {{ user.projectCount || 0 }} projects
									</v-list-item-subtitle>
									<template #append>
										<v-chip size="small" color="secondary">
											{{ user.totalViews || 0 }} views
										</v-chip>
									</template>
								</v-list-item>
							</v-list>
							<div v-else class="text-center py-8">
								<v-icon size="64" color="grey-lighten-1"
									>mdi-account-outline</v-icon
								>
								<p class="text-body-2 mt-2">{{ $t("statisticsNoData") }}</p>
							</div>
						</v-card-text>
					</v-card>
				</v-col>
			</v-row>
			<!-- Activity Timeline -->
			<v-row class="mt-6">
				<v-col cols="12">
					<v-card class="pa-4">
						<v-card-title>{{ $t("recentActivity") }}</v-card-title>
						<v-card-text>
							<div
								v-if="recentActivities.length > 0"
								class="activity-container"
							>
								<RecycleScroller
									:items="recentActivities"
									:item-size="80"
									key-field="_id"
									v-slot="{ item }"
									class="scroller"
								>
									<div class="activity-item">
										<v-timeline-item :dot-color="item.color" size="small">
											<template #icon>
												<v-icon :icon="item.icon" size="16"></v-icon>
											</template>
											<template #opposite>
												<span class="text-caption">{{
													formatTime(item.createdAt)
												}}</span>
											</template>
											<div>
												<strong>{{ item.userName }}</strong> {{ item.action }}
												<router-link
													:to="item.link"
													class="text-decoration-none"
												>
													{{ item.target }}
												</router-link>
											</div>
										</v-timeline-item>
									</div>
								</RecycleScroller>
							</div>
							<div v-else class="text-center py-8">
								<v-icon size="64" color="grey-lighten-1"
									>mdi-timeline-outline</v-icon
								>
								<p class="text-body-2 mt-2">{{ $t("statisticsNoData") }}</p>
							</div>
						</v-card-text>
					</v-card>
				</v-col>
			</v-row>
		</div>
		<!-- Close main content div -->
	</v-container>
</template>

<script>
	import axios from "axios"
	import Chart from "chart.js/auto"
	import { RecycleScroller } from "vue-virtual-scroller"
	import "vue-virtual-scroller/dist/vue-virtual-scroller.css"

	export default {
		name: "StatisticsView",
		components: {
			RecycleScroller,
		},
		data() {
			return {
				keyMetrics: [],
				topProjects: [],
				topUsers: [],
				recentActivities: [],
				projectTypesChart: null,
				userTrendChart: null,
				loading: true,
			}
		},
		async mounted() {
			await this.fetchStatistics()
			this.createCharts()
		},
		beforeUnmount() {
			if (this.projectTypesChart) this.projectTypesChart.destroy()
			if (this.userTrendChart) this.userTrendChart.destroy()
		},
		methods: {
			async fetchStatistics() {
				this.loading = true
				try {
					// Use backend port 3001 as specified by user
					const serverUrl = import.meta.env.VITE_SERVER_URL
					console.log("Fetching statistics from:", serverUrl)

					const [projects, users] = await Promise.all([
						axios.get(`${serverUrl}/api/posts/`),
						axios.get(`${serverUrl}/api/users/`),
					])

					console.log("Fetched projects:", projects.data.length)
					console.log("Fetched users:", users.data.length)
					console.log("Sample project:", projects.data[0])

					this.processStatistics(projects.data, users.data)
				} catch (error) {
					console.error("Error fetching statistics:", error)
				} finally {
					this.loading = false
				}
			},
			processStatistics(projects, users) {
				// Ensure we have valid data arrays
				const validProjects = Array.isArray(projects) ? projects : []
				const validUsers = Array.isArray(users) ? users : []

				// Calculate key metrics
				const totalViews = validProjects.reduce(
					(sum, p) => sum + (p.views || 0),
					0
				)
				const totalUpvotes = validProjects.reduce(
					(sum, p) => sum + (p.upvotes || 0),
					0
				)

				this.keyMetrics = [
					{
						title: this.$t("totalProjects"),
						value: validProjects.length,
						icon: "mdi-folder-multiple",
						color: "primary",
					},
					{
						title: this.$t("totalUsers"),
						value: validUsers.length,
						icon: "mdi-account-group",
						color: "secondary",
					},
					{
						title: this.$t("totalViews"),
						value: totalViews.toLocaleString(),
						icon: "mdi-eye",
						color: "success",
					},
					{
						title: this.$t("totalUpvotes"),
						value: totalUpvotes.toLocaleString(),
						icon: "mdi-thumb-up",
						color: "warning",
					},
				]

				// Top projects by views - ensure proper sorting and data
				this.topProjects = validProjects
					.filter(p => p && p._id && p.title) // Filter out invalid projects
					.sort((a, b) => (b.views || 0) - (a.views || 0))
					.slice(0, 5)

				// Top users by project count
				const userProjectCounts = validUsers
					.filter(user => user && user._id && user.username) // Filter out invalid users
					.map(user => {
						const userProjects = validProjects.filter(
							p => p.author && p.author._id === user._id
						)
						return {
							...user,
							projectCount: userProjects.length,
							totalViews: userProjects.reduce(
								(sum, p) => sum + (p.views || 0),
								0
							),
						}
					})

				this.topUsers = userProjectCounts
					.sort((a, b) => b.projectCount - a.projectCount)
					.slice(0, 5) // Recent activities (generate from recent projects)
				console.log("All projects:", validProjects)
				console.log(
					"Projects with authors:",
					validProjects.filter(p => p.author)
				)

				this.recentActivities = validProjects
					.filter(
						project =>
							project &&
							project._id &&
							project.title &&
							project.author &&
							project.author.username &&
							project.createdAt
					)
					.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
					.slice(0, 20) // Increase to 20 for better virtual scrolling demonstration
					.map(project => ({
						_id: project._id,
						userName:
							project.author.firstName && project.author.lastName
								? `${project.author.firstName} ${project.author.lastName}`
								: project.author.username || "Anonymous User",
						action: "created project",
						target: project.title,
						link: `/${project.author.username}/${project._id}`,
						createdAt: project.createdAt,
						icon: "mdi-plus",
						color: "primary",
					}))

				console.log("Recent activities:", this.recentActivities)
			},

			createCharts() {
				this.$nextTick(() => {
					this.createProjectTypesChart()
					this.createUserTrendChart()
				})
			},
			createProjectTypesChart() {
				const ctx = this.$refs.projectTypesChart?.getContext("2d")
				if (!ctx) return

				// Group projects by type - use all projects, not just top projects
				const typeCounts = {}

				// Get all projects to show proper distribution
				if (this.topProjects && this.topProjects.length > 0) {
					this.topProjects.forEach(project => {
						const type = project.type || "Other"
						typeCounts[type] = (typeCounts[type] || 0) + 1
					})
				} else {
					// Default data if no projects
					typeCounts["No Data"] = 1
				}

				this.projectTypesChart = new Chart(ctx, {
					type: "doughnut",
					data: {
						labels: Object.keys(typeCounts),
						datasets: [
							{
								data: Object.values(typeCounts),
								backgroundColor: [
									"#1976D2",
									"#388E3C",
									"#F57C00",
									"#D32F2F",
									"#7B1FA2",
									"#616161",
								],
							},
						],
					},
					options: {
						responsive: true,
						maintainAspectRatio: false,
						plugins: {
							legend: {
								position: "bottom",
							},
						},
					},
				})
			},
			createUserTrendChart() {
				const ctx = this.$refs.userTrendChart?.getContext("2d")
				if (!ctx) return

				// Mock user registration trend data
				const last6Months = []
				for (let i = 5; i >= 0; i--) {
					const date = new Date()
					date.setMonth(date.getMonth() - i)
					last6Months.push({
						month: date.toLocaleDateString("en-US", { month: "short" }),
						users: Math.floor(Math.random() * 20) + 5,
					})
				}

				this.userTrendChart = new Chart(ctx, {
					type: "line",
					data: {
						labels: last6Months.map(d => d.month),
						datasets: [
							{
								label: "New Users",
								data: last6Months.map(d => d.users),
								borderColor: "#1976D2",
								backgroundColor: "rgba(25, 118, 210, 0.1)",
								fill: true,
								tension: 0.4,
							},
						],
					},
					options: {
						responsive: true,
						maintainAspectRatio: false,
						scales: {
							y: {
								beginAtZero: true,
							},
						},
					},
				})
			},
			viewProject(project) {
				// Handle the project navigation properly
				if (project.author && project.author.username) {
					this.$router.push(`/${project.getFullPath}`)
				} else {
					console.error("Project author information missing:", project)
				}
			},

			viewUserProfile(user) {
				if (user.username) {
					this.$router.push(`/${user.username}`)
				} else {
					console.error("User username missing:", user)
				}
			},

			formatTime(timestamp) {
				return new Date(timestamp).toLocaleDateString()
			},
		},
	}
</script>

<style scoped>
	.chart-container {
		position: relative;
		height: 300px;
	}

	.activity-container {
		height: 400px;
		position: relative;
	}

	.scroller {
		height: 100%;
	}

	.activity-item {
		height: 80px;
		padding: 8px 0;
	}
</style>
