<template>
	<div>
		<v-container>
			<!-- Hero Section -->
			<section aria-labelledby="hero-heading">
				<v-row class="mt-16 mb-8">
					<v-col cols="12">
						<h1 id="hero-heading" class="text-h2 font-weight-bold mb-4">
							Showcase Your Projects
						</h1>
						<p class="text-h6 mb-6">
							A platform for independent developers and creators to showcase
							their work. Share your projects, get feedback, and connect with
							other creators.
						</p>
						<v-btn color="primary" size="large" to="/projects" class="mr-4"
							>Browse Projects</v-btn
						>
						<v-btn variant="outlined" size="large" to="/login"
							>Get Started</v-btn
						>
					</v-col>
					<v-col cols="12" md="6" class="d-flex align-center justify-center">
						<v-img
							src="https://via.placeholder.com/500x300"
							max-width="500"
							class="rounded-lg"
							alt="CodeFolio platform showcase illustration"
						></v-img>
					</v-col>
				</v-row>
			</section>

			<!-- Featured Projects Section with RecycleScroller -->
			<section>
				<v-row class="mt-8">
					<v-col cols="12">
						<h2 id="featured-projects-heading" class="text-h4 mb-6">
							Featured Projects
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
											View Project
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
	import "vue-virtual-scroller/dist/vue-virtual-scroller.css"

	export default {
		name: "HomeView",
		components: { RecycleScroller },
		data() {
			return {
				featuredProjects: [],
			}
		},
		mounted() {
			axios
				.get("https://server-codefolio.vercel.app/api/posts/")
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
