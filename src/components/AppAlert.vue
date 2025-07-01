<template>
	<v-alert
		v-if="message"
		:type="type"
		:class="alertClasses"
		border="start"
		colored-border
		elevation="0"
		density="comfortable"
		role="alert"
		:aria-live="type === 'error' ? 'assertive' : 'polite'"
	>
		<template #prepend>
			<v-icon :color="type" size="24" aria-hidden="true">
				{{ iconMap[type] }}
			</v-icon>
		</template>
		{{ message }}
	</v-alert>
</template>

<script>
	export default {
		name: "AppAlert",
		props: {
			message: {
				type: String,
				default: "",
			},
			type: {
				type: String,
				default: "info",
				validator: value =>
					["error", "success", "warning", "info"].includes(value),
			},
			customClass: {
				type: String,
				default: "",
			},
		},
		computed: {
			alertClasses() {
				const baseClasses = this.customClass || "mb-4"
				const typeClasses = {
					error: "bg-white text-red-darken-1 font-weight-medium",
					success: "bg-white text-green-darken-1 font-weight-medium",
					warning: "bg-white text-orange-darken-1 font-weight-medium",
					info: "bg-white text-blue-darken-1 font-weight-medium",
				}
				return `${baseClasses} ${typeClasses[this.type] || typeClasses.info}`
			},
			iconMap() {
				return {
					error: "mdi-alert-circle",
					success: "mdi-check-circle",
					warning: "mdi-alert",
					info: "mdi-information",
				}
			},
		},
	}
</script>
