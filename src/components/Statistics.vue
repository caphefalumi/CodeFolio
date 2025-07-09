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
				<!-- Technology Stack Distribution -->
				<v-col cols="12" md="6">
					<v-card class="pa-4">
						<v-card-title>{{
							$t("technologyStackDistribution") || "Popular Technologies"
						}}</v-card-title>
						<v-card-text>
							<div class="chart-container">
								<canvas ref="techStackChart" width="400" height="300"></canvas>
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
				topProjects: [],
				topUsers: [],
				allUsers: [],
				allProjects: [],
				recentActivities: [],
				projectTypesChart: null,
				techStackChart: null,
				loading: true,
			}
		},
		computed: {
			keyMetrics() {
				// Calculate key metrics reactively
				const totalViews = this.allProjects.reduce(
					(sum, p) => sum + (p.views || 0),
					0
				)
				const totalUpvotes = this.allProjects.reduce(
					(sum, p) => sum + (p.upvotes || 0),
					0
				)

				return [
					{
						title: this.$t("totalProjects"),
						value: this.allProjects.length,
						icon: "mdi-folder-multiple",
						color: "primary",
					},
					{
						title: this.$t("totalUsers"),
						value: this.allUsers.length,
						icon: "mdi-account-group",
						color: "primary",
					},
					{
						title: this.$t("totalViews"),
						value: totalViews.toLocaleString(),
						icon: "mdi-eye",
						color: "primary",
					},
					{
						title: this.$t("totalUpvotes"),
						value: totalUpvotes.toLocaleString(),
						icon: "mdi-thumb-up",
						color: "warning",
					},
				]
			},
		},
		async mounted() {
			await this.fetchStatistics()
			this.createCharts()
		},
		beforeUnmount() {
			if (this.projectTypesChart) this.projectTypesChart.destroy()
			if (this.techStackChart) this.techStackChart.destroy()
		},
		methods: {
			async fetchStatistics() {
				this.loading = true
				try {
					const [projects, users] = await Promise.all([
						axios.get(`${import.meta.env.VITE_SERVER_URL}/api/posts/`),
						axios.get(`${import.meta.env.VITE_SERVER_URL}/api/users/`),
					])

					this.allUsers = users.data || []
					this.allProjects = projects.data || []
					this.processStatistics()
				} catch (error) {
					console.error("Error fetching statistics:", error)
				} finally {
					this.loading = false
				}
			},
			processStatistics() {
				this.topProjects = this.allProjects
					.filter(p => p && p._id && p.title)
					.sort((a, b) => (b.views || 0) - (a.views || 0))
					.slice(0, 5)

				// Top users by project count
				const userProjectCounts = this.allUsers
					.filter(user => user && user._id && user.username)
					.map(user => {
						const userProjects = this.allProjects.filter(
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
					.slice(0, 5)

				console.log("All projects:", this.allProjects)
				console.log(
					"Projects with authors:",
					this.allProjects.filter(p => p.author)
				)

				this.recentActivities = this.allProjects
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
					.slice(0, 20)
					.map(project => ({
						_id: project._id,
						userName: project.author.username || "Deleted User",
						action: this.$t("createdProject"),
						target: project.title,
						link: `/${project.author.username}/${project._id}`,
						createdAt: project.createdAt,
						icon: "mdi-plus",
						color: "primary",
					}))
			},
			createCharts() {
				this.$nextTick(() => {
					this.createProjectTypesChart()
					this.createTechStackChart()
				})
			},
			createProjectTypesChart() {
				const ctx = this.$refs.projectTypesChart?.getContext("2d")
				if (!ctx) return

				const typeCounts = {}

				if (this.topProjects && this.topProjects.length > 0) {
					this.topProjects.forEach(project => {
						const type = project.type || "Other"
						typeCounts[type] = (typeCounts[type] || 0) + 1
					})
				} else {
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
			createTechStackChart() {
				const ctx = this.$refs.techStackChart?.getContext("2d")
				if (!ctx) return

				const techCounts = {}
				const commonTechs = [
					"JavaScript",
					"TypeScript",
					"React",
					"Vue",
					"Angular",
					"Node.js",
					"Python",
					"Java",
					"C++",
					"C#",
					"PHP",
					"HTML",
					"CSS",
					"MongoDB",
					"MySQL",
					"PostgreSQL",
					"Express",
					"Next.js",
					"Nuxt.js",
					"Laravel",
					"Django",
					"Flask",
					"Spring",
					"Docker",
					"AWS",
					"Azure",
					"Firebase",
					"Git",
					"Redux",
					"Vuex",
					"GraphQL",
					"REST API",
					"TailwindCSS",
					"Bootstrap",
					"Sass",
					"Webpack",
					"Vite",
					"jQuery",
					"Rust",
					"Go",
					"Swift",
					"Kotlin",
					"Flutter",
					"React Native",
					"Electron",
				]

				// Analyze all projects (not just top 5)
				if (this.allProjects && this.allProjects.length > 0) {
					this.allProjects.forEach(project => {
						// First priority: Check actual project tags
						if (project.tags && Array.isArray(project.tags)) {
							project.tags.forEach(tag => {
								if (tag && tag.trim()) {
									const cleanTag = tag.trim()
									// Check if tag matches common technologies (case insensitive)
									const matchedTech = commonTechs.find(
										tech => tech.toLowerCase() === cleanTag.toLowerCase()
									)
									if (matchedTech) {
										techCounts[matchedTech] = (techCounts[matchedTech] || 0) + 1
									} else {
										techCounts[cleanTag] = (techCounts[cleanTag] || 0) + 1
									}
								}
							})
						}

						const projectText =
							`${project.title || ""} ${project.description || ""} ${project.content || ""}`.toLowerCase()

						commonTechs.forEach(tech => {
							// Only count if not already counted from tags
							const projectHasTechTag =
								project.tags &&
								project.tags.some(
									tag => tag.toLowerCase() === tech.toLowerCase()
								)

							if (
								!projectHasTechTag &&
								projectText.includes(tech.toLowerCase())
							) {
								techCounts[tech] = (techCounts[tech] || 0) + 1
							}
						})
					})
				}

				let labels,
					data,
					hasRealData = true

				if (Object.keys(techCounts).length === 0) {
					hasRealData = false
					labels = ["No Technology Data"]
					data = [1]
				} else {
					const sortedTechs = Object.entries(techCounts)
						.sort(([, a], [, b]) => b - a)
						.slice(0, 10)

					labels = sortedTechs.map(([tech]) => tech)
					data = sortedTechs.map(([, count]) => count)
				}

				const colors = hasRealData
					? [
							"#1976D2",
							"#388E3C",
							"#F57C00",
							"#D32F2F",
							"#7B1FA2",
							"#616161",
							"#795548",
							"#E91E63",
							"#009688",
							"#FF5722",
						]
					: ["#BDBDBD"]

				const borderColors = hasRealData
					? [
							"#1565C0",
							"#2E7D32",
							"#EF6C00",
							"#C62828",
							"#6A1B9A",
							"#424242",
							"#5D4037",
							"#C2185B",
							"#00796B",
							"#E64A19",
						]
					: ["#9E9E9E"]

				this.techStackChart = new Chart(ctx, {
					type: "bar",
					data: {
						labels: labels,
						datasets: [
							{
								data: data,
								backgroundColor: colors,
								borderColor: borderColors,
								borderWidth: 2,
								borderRadius: 8,
								borderSkipped: false,
							},
						],
					},
					options: {
						responsive: true,
						maintainAspectRatio: false,
						plugins: {
							legend: {
								display: false,
							},
							tooltip: {
								enabled: hasRealData,
								borderWidth: 1,
								cornerRadius: 8,
								callbacks: {
									title: function (context) {
										return context[0].label
									},
									label: function (context) {
										if (!hasRealData) return "No technology data available"
										const count = context.parsed.y
										return `Used in ${count} ${count === 1 ? "project" : "projects"}`
									},
								},
							},
						},
						scales: {
							x: {
								title: {
									display: true,
									text: this.$t("technologies"),
									font: {
										size: 12,
										weight: "bold",
									},
								},
								grid: {
									display: false,
								},
								ticks: {
									maxRotation: 45,
									minRotation: 45,
									font: {
										size: 10,
									},
								},
							},
							y: {
								beginAtZero: true,
								title: {
									display: true,
									text: this.$t("numberOfProjects"),
									font: {
										size: 12,
										weight: "bold",
									},
								},
								grid: {
									color: "rgba(0, 0, 0, 0.1)",
								},
								ticks: {
									stepSize: 1,
									font: {
										size: 11,
									},
								},
							},
						},
						animation: {
							duration: 1500,
							easing: "easeInOutQuart",
						},
						onHover: (event, activeElements) => {
							if (hasRealData) {
								event.native.target.style.cursor =
									activeElements.length > 0 ? "pointer" : "default"
							}
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
