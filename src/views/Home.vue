<template>
	<div>
		<v-container>
			<!-- Hero Section -->
			<section aria-labelledby="hero-heading">
				<v-row class="mt-16 mb-8">
					<v-col cols="12">
						<h1 id="hero-heading" class="text-h2 font-weight-bold mb-4">
							{{ $t("homeTitle") }}
						</h1>
						<p class="text-h6 mb-6">
							{{ $t("homeSubtitle") }}
						</p>
						<v-btn color="primary" size="large" to="/projects" class="mr-4">{{
							$t("navProjects")
						}}</v-btn>
						<v-btn
							v-if="!continueTour"
							variant="outlined"
							size="large"
							@click="startTour"							
							>{{ $t("getStarted") }}</v-btn
						>
						<v-btn
							v-else
							variant="outlined"
							size="large"
							@click="startTour"							
							>{{ $t("tourContinue") }}</v-btn
						>
					</v-col>
				</v-row>
			</section>
			<!-- Overview Section -->
			<div class="platform-features" id="tour-step-platform-overview">
				<v-row>
					<v-col cols="12" md="4">
						<v-card class="pa-4">
							<h3 class="text-h6 font-weight-bold mb-2">
								{{ $t("homeFrontendTitle") }}
							</h3>
							<p>{{ $t("homeFrontendDesc") }}</p>
						</v-card>
					</v-col>
					<v-col cols="12" md="4">
						<v-card class="pa-4">
							<h3 class="text-h6 font-weight-bold mb-2">
								{{ $t("homeBackendTitle") }}
							</h3>
							<p>{{ $t("homeBackendDesc") }}</p>
						</v-card>
					</v-col>
					<v-col cols="12" md="4">
						<v-card class="pa-4">
							<h3 class="text-h6 font-weight-bold mb-2">
								{{ $t("homeSecurityTitle") }}
							</h3>
							<p>{{ $t("homeSecurityDesc") }}</p>
						</v-card>
					</v-col>
				</v-row>
			</div>
			<!-- Featured Projects Section with RecycleScroller -->
			<section>
				<v-row class="mt-8">
					<v-col cols="12">
						<h2 id="featured-projects-heading" class="text-h4 mb-6">
							{{ $t("featuredProjects") }}
						</h2>
					</v-col>
					<v-col cols="12">
						<RecycleScroller
							:items="featuredProjects"
							:item-size="200"
							key-field="_id"
							v-slot="{ item }"
						>
							<article class="project-item">
								<v-card>
									<v-card-title>{{ item.title }}</v-card-title>
									<v-card-text>
										<p>{{ item.description || "No description provided." }}</p>
									</v-card-text>
									<v-card-actions>
										<v-btn
											color="primary"
											variant="text"
											:to="`${item.getFullPath}`"
										>
											{{ $t("viewProject") }}
										</v-btn>
									</v-card-actions>
								</v-card>
							</article>
						</RecycleScroller>
					</v-col>
				</v-row>
			</section>
		</v-container>
	</div>
</template>

<script>
	import axios from "axios"
	import { RecycleScroller } from "vue-virtual-scroller"
	import { startAppTour } from '@/tour.js'
	import { useI18n } from 'vue-i18n'
	import "vue-virtual-scroller/dist/vue-virtual-scroller.css"

	export default {
		name: "HomeView",
		components: { RecycleScroller },
		setup() {
			const { t } = useI18n()
			return { t }
		},
		data() {
			return {
				featuredProjects: [],
				continueTour: (() => {
					const state = localStorage.getItem("tour-state")
					if (!state) return false
					try {
						const parsed = JSON.parse(state)
						return typeof parsed.step === 'number' && parsed.step > 0
					} catch {
						return false
					}
				})()

			}
		},
		mounted() {
			axios
				.get(`${import.meta.env.VITE_SERVER_URL}/api/posts/`)
				.then(response => {
					this.featuredProjects = response.data
					console.log("Projects:", this.featuredProjects)
				})
				.catch(error => {
					console.error("Error fetching featured projects:", error)
				})
		},
		methods: {
			startTour() {
				startAppTour(this.$router, this)
			},
		},
	}
</script>

<style scoped>
	.project-item {
		height: 200px; /* Match the item-size prop */
		padding: 8px;
		display: flex;
		flex-direction: column;
	}

	.project-item .v-card {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.project-item .v-card-text {
		flex-grow: 1;
		overflow: hidden;
	}
</style>
