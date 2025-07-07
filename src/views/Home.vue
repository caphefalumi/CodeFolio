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
							v-if="!isLoggedIn"
							variant="outlined"
							size="large"
							to="/login"
							>{{ $t("getStarted") }}</v-btn
						>
					</v-col>
				</v-row>
			</section>

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
	import { isLoggedIn, getAccessToken } from "@/composables/user"
	import "vue-virtual-scroller/dist/vue-virtual-scroller.css"

	export default {
		name: "HomeView",
		components: { RecycleScroller },
		data() {
			return {
				featuredProjects: [],
				isLoggedIn: isLoggedIn(),
			}
		},
		mounted() {
			let headers = {}
			const token = getAccessToken()
			if (token) {
				headers.Authorization = `Bearer ${token}`
			}

			axios
				.get(`${import.meta.env.VITE_SERVER_URL}/api/posts/`, { headers })
				.then(response => {
					this.featuredProjects = response.data
					console.log("Projects:", this.featuredProjects)
				})
				.catch(error => {
					console.error("Error fetching featured projects:", error)
				})
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
