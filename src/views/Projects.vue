<template>
	<div>
		<v-container id="tour-step-projects-page-welcome">
			<!-- Search and Filter Section -->
			<section>
				<v-row class="mb-12">
					<v-col cols="12" md="5">
						<v-text-field
							v-model="search"
							:label="$t('searchPlaceholder')"
							prepend-inner-icon="mdi-magnify"
							variant="outlined"
							hide-details
							maxlength="100"
							id="tour-step-projects-search"
						></v-text-field>
					</v-col>
					<v-col cols="12" md="3">
						<v-select
							v-model="selectedType"
							:items="projectTypes"
							item-title="title"
							item-value="value"
							id="project-type-filter"
							:label="$t('projectType')"
							variant="outlined"
							hide-details
							@focus="onTypeFilterFocus"
						></v-select>
					</v-col>
					<v-col cols="12" md="4">
						<v-select
							v-model="sortBy"
							:items="sortOptions"
							item-title="title"
							item-value="value"
							id="project-sort"
							:prepend-inner-icon="
								sortBy === 'newest'
									? 'mdi-sort-descending'
									: sortBy === 'viewed'
										? 'mdi-eye'
										: 'mdi-star'
							"
							:label="$t('sortBy')"
							variant="outlined"
							hide-details
							@focus="onSortFocus"
						></v-select>
					</v-col>
				</v-row>
			</section>
			<!-- Projects Grid -->
			<section>
				<v-row v-if="paginatedProjects.length > 0" v-auto-animate>
					<v-col
						v-for="project in paginatedProjects"
						:key="project._id"
						cols="12"
						md="4"
					>
						<article id="tour-step-project-card">
							<project-card
								:project="project"
								:show-edit-button="false"
								:show-delete-button="false"
								@view="viewProject"
							/>
						</article>
					</v-col>
				</v-row>

				<!-- No Results Message -->
				<v-row v-else-if="projects.length > 0">
					<v-col cols="12" class="text-center">
						<v-card class="pa-8" color="grey-lighten-5">
							<v-icon size="64" color="grey-lighten-1" class="mb-4"
								>mdi-magnify</v-icon
							>
							<h3 class="text-h5 mb-2">{{ $t("noProjectsFound") }}</h3>
							<p class="text-body-1 mb-4">
								{{ $t("adjustFilters") }}
							</p>
							<v-btn
								color="primary"
								variant="outlined"
								@click="((search = ''), (selectedType = 'all'))"
							>
								{{ $t("clearFilters") }}
							</v-btn>
						</v-card>
					</v-col>
				</v-row>

				<!-- Loading State -->
				<v-row v-else>
					<v-col cols="12" class="text-center">
						<v-progress-circular
							indeterminate
							color="primary"
						></v-progress-circular>
						<p class="mt-4">{{ $t("loadingProjects") }}</p>
					</v-col>
				</v-row>
			</section>
			<!-- Pagination -->
			<section>
				<v-row class="mt-6">
					<v-col cols="12" class="text-center">
						<v-pagination
							v-model="page"
							:length="totalPages"
							rounded
						></v-pagination>
					</v-col>
				</v-row>
			</section>
			<app-alert
				v-if="errorMessage"
				type="error"
				:message="errorMessage"
				custom-class="mb-4"
			/>
		</v-container>
	</div>
</template>

<script>
	import axios from "axios"
	import AppAlert from "@/components/AppAlert.vue"
	import ProjectCard from "@/components/ProjectCard.vue"
	import { useApi } from "@/composables/common.js"

	export default {
		name: "ProjectsView",
		components: {
			AppAlert,
			ProjectCard,
		},
		setup() {
			const { getErrorMessage } = useApi()
			return { getErrorMessage }
		},
		data() {
			return {
				projects: [],
				search: "",
				selectedType: "all",
				sortBy: "newest",
				page: 1,
				itemsPerPage: 6,
				errorMessage: "",
			}
		},
		computed: {
			projectTypes() {
				return [
					{ title: this.$t("allTypes"), value: "all" },
					{ title: this.$t("Web Development"), value: "Web Development" },
					{ title: this.$t("Mobile App"), value: "Mobile App" },
					{ title: this.$t("API Development"), value: "API Development" },
					{ title: this.$t("Game"), value: "Game" },
					{ title: this.$t("Design"), value: "Design" },
					{ title: this.$t("Data Science"), value: "Data Science" },
					{ title: this.$t("Machine Learning"), value: "Machine Learning" },
					{ title: this.$t("DevOps"), value: "DevOps" },
					{ title: this.$t("Other"), value: "Other" },
				]
			},
			sortOptions() {
				return [
					{ title: this.$t("newestFirst"), value: "newest" },
					{ title: this.$t("mostViewed"), value: "viewed" },
					{ title: this.$t("highestRated"), value: "highest" },
				]
			},
			filteredProjects() {
				let filtered = this.projects
				if (this.selectedType !== "all") {
					filtered = filtered.filter(
						project => project.type === this.selectedType
					)
				}
				if (this.search && this.search.trim()) {
					const searchTerm = this.search.trim()
					// If search starts with #, filter by tag
					if (searchTerm.startsWith("#")) {
						const tagQuery = searchTerm.slice(1).toLowerCase()
						filtered = filtered.filter(
							project =>
								Array.isArray(project.tags) &&
								project.tags.some(
									tag => tag && tag.toLowerCase().includes(tagQuery)
								)
						)
					} else if (searchTerm.startsWith("@")) {
						const usernameQuery = searchTerm.slice(1).toLowerCase()
						filtered = filtered.filter(project =>
							project.author?.username?.toLowerCase().includes(usernameQuery)
						)
					} else {
						// Regular text search with proper null checks
						const searchLower = searchTerm.toLowerCase()
						filtered = filtered.filter(project => {
							const title = project.title || ""
							const description = project.description || ""
							return (
								title.toLowerCase().includes(searchLower) ||
								description.toLowerCase().includes(searchLower)
							)
						})
					}
				}

				if (this.sortBy === "newest") {
					filtered = filtered.sort(
						(a, b) => new Date(b.createdAt) - new Date(a.createdAt)
					)
				} else if (this.sortBy === "viewed") {
					filtered = filtered.sort((a, b) => (b.views || 0) - (a.views || 0))
				} else if (this.sortBy === "highest") {
					filtered = filtered.sort(
						(a, b) =>
							(b.upvotes || 0) -
							(b.downvotes || 0) -
							(a.upvotes || 0) +
							(a.downvotes || 0)
					)
				}

				return filtered
			},
			totalPages() {
				return Math.ceil(this.filteredProjects.length / this.itemsPerPage)
			},
			paginatedProjects() {
				const start = (this.page - 1) * this.itemsPerPage
				return this.filteredProjects.slice(start, start + this.itemsPerPage)
			},
		},
		watch: {
			search(newVal, oldVal) {
				console.log("Search changed from:", oldVal, "to:", newVal)
				console.log("Filtered results count:", this.filteredProjects.length)
				if (this.filteredProjects.length === 0 && this.projects.length > 0) {
					console.warn("Search returned no results! Debug info:")
				}
			},
		},
		methods: {
			viewProject(project) {
				this.$router.push(
					`/${project.author?.username || "unknown"}/${project._id}`
				)
			},
			onTypeFilterFocus() {
				this.$nextTick(() => {
					const filterEl = document.getElementById(
						"tour-step-project-type-filter"
					)
					if (filterEl) {
						filterEl.scrollIntoView({ behavior: "smooth", block: "center" })
					}
				})
			},
			onSortFocus() {
				this.$nextTick(() => {
					const sortEl = document.getElementById("tour-step-project-sort")
					if (sortEl) {
						sortEl.scrollIntoView({ behavior: "smooth", block: "center" })
					}
				})
			},
		},
		async mounted() {
			try {
				const response = await axios.get(
					`${import.meta.env.VITE_SERVER_URL}/api/posts/`
				)
				this.projects = response.data
				console.log("Projects loaded:", this.projects.length)

				// Debug: Log the structure of the first project
				if (this.projects.length > 0) {
					console.log("Sample project structure:", {
						title: this.projects[0].title,
						description: this.projects[0].description,
						author: this.projects[0].author,
						tags: this.projects[0].tags,
						type: this.projects[0].type,
					})
				}
			} catch (error) {
				console.error("Error fetching projects:", error)
				this.errorMessage = this.getErrorMessage(
					error,
					"Failed to load projects. Please try again."
				)
			}
		},
	}
</script>
