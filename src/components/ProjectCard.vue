<template>
	<v-card class="project-card elevation-1 mb-4" :class="cardClass">
		<v-img
			:src="project.coverImage"
			:height="imageHeight"
			cover
			class="rounded-t-lg"
			:alt="`${project.title} project cover image`"
		></v-img>

		<v-card-title class="font-weight-bold">
			{{ project.title }}
		</v-card-title>

		<v-card-text>
			<div class="text-body-2 mb-2">{{ project.description }}</div>
			<div class="mb-2" role="list" aria-label="Project tags">
				<v-chip
					v-for="tag in project.tags"
					:key="tag"
					class="mr-2 mb-2"
					size="small"
					role="listitem"
				>
					{{ tag }}
				</v-chip>
			</div>
		</v-card-text>

		<v-card-actions class="px-0">
			<app-button
				color="primary"
				variant="text"
				prepend-icon="mdi-eye"
				:aria-label="`View project: ${project.title}`"
				@click="$emit('view', project)"
			>
				{{ $t("projectCardView") }}
			</app-button>
			<app-button
				v-if="showEditButton"
				color="primary"
				variant="text"
				prepend-icon="mdi-pencil"
				:aria-label="`Edit project: ${project.title}`"
				@click="$emit('edit', project)"
			>
				{{ $t("projectCardEdit") }}
			</app-button>
			<app-button
				v-if="showDeleteButton"
				color="error"
				variant="text"
				prepend-icon="mdi-delete"
				:aria-label="`Delete project: ${project.title}`"
				@click="$emit('delete', project)"
			>
				{{ $t("projectCardDelete") }}
			</app-button>

			<v-spacer v-if="showLikeButton"></v-spacer>
			<app-button
				v-if="showLikeButton"
				icon
				:color="project.liked ? 'red' : 'grey'"
				:aria-label="`${project.liked ? $t('projectCard.unlike') : $t('projectCard.like')} project: ${project.title}`"
				@click="$emit('like', project)"
			>
				<v-icon>
					{{ project.liked ? "mdi-heart" : "mdi-heart-outline" }}
				</v-icon>
			</app-button>

			<slot name="actions" :project="project"></slot>
		</v-card-actions>
	</v-card>
</template>

<script>
	import AppButton from "./AppButton.vue"

	export default {
		name: "ProjectCard",
		components: {
			AppButton,
		},
		props: {
			project: {
				type: Object,
				required: true,
			},
			showEditButton: {
				type: Boolean,
				default: false,
			},
			showDeleteButton: {
				type: Boolean,
				default: false,
			},
			showLikeButton: {
				type: Boolean,
				default: false,
			},
			imageHeight: {
				type: [String, Number],
				default: 180,
			},
			cardClass: {
				type: String,
				default: "",
			},
		},
		emits: ["view", "edit", "delete", "like"],
	}
</script>

<style scoped>
	.project-card {
		border-radius: 12px;
		transition: box-shadow 0.2s;
	}

	.project-card:hover {
		box-shadow: 0 8px 32px rgba(44, 62, 80, 0.18);
	}
</style>
