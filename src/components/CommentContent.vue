<template>
	<span class="comment-content">
		<template v-for="(part, index) in renderedContent" :key="index">
			<router-link
				v-if="part.type === 'mention'"
				:to="`/${part.username}`"
				class="mention-link"
				@click="$emit('mention-click', part.username)"
			>
				{{ part.text }}
			</router-link>
			<span v-else>{{ part.text }}</span>
		</template>
	</span>
</template>

<script>
	export default {
		name: "CommentContent",
		props: {
			content: {
				type: String,
				required: true,
			},
		},
		emits: ["mention-click"],
		computed: {
			renderedContent() {
				if (!this.content) return [] // Regex to match @username (alphanumeric + underscore + dot)
				const mentionRegex = /@([a-zA-Z0-9_.]+)/g
				const parts = []
				let lastIndex = 0
				let match

				while ((match = mentionRegex.exec(this.content)) !== null) {
					// Add text before mention
					if (match.index > lastIndex) {
						parts.push({
							type: "text",
							text: this.content.slice(lastIndex, match.index),
						})
					}

					// Add mention
					parts.push({
						type: "mention",
						username: match[1],
						text: match[0],
					})

					lastIndex = match.index + match[0].length
				}

				// Add remaining text
				if (lastIndex < this.content.length) {
					parts.push({
						type: "text",
						text: this.content.slice(lastIndex),
					})
				}

				return parts.length ? parts : [{ type: "text", text: this.content }]
			},
		},
	}
</script>

<style scoped>
	.mention-link {
		color: #1976d2;
		text-decoration: none;
		font-weight: 500;
		transition: color 0.2s;
	}

	.mention-link:hover {
		color: #1565c0;
		text-decoration: underline;
	}
</style>
