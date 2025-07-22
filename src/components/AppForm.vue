<template>
	<v-form
		@submit.prevent="handleSubmit"
		class="app-form"
	>
		<slot></slot>

		<app-alert
			v-if="errorMessage"
			type="error"
			:message="errorMessage"
			:custom-class="alertClass"
		/>

		<app-alert
			v-if="successMessage"
			type="success"
			:message="successMessage"
			:custom-class="alertClass"
		/>

		<app-button
			v-if="showSubmitButton"
			:type="submitButtonType"
			:color="submitButtonColor"
			:variant="submitButtonVariant"
			:block="submitButtonBlock"
			:loading="loading"
			:disabled="disabled"
			:aria-label="submitAriaLabel"
			:button-class="submitButtonClass"
			@click="handleSubmit"
		>
			{{ submitButtonText }}
		</app-button>

		<slot name="actions"></slot>
	</v-form>
</template>

<script>
	import AppAlert from "./AppAlert.vue"
	import AppButton from "./AppButton.vue"

	export default {
		name: "AppForm",
		components: {
			AppAlert,
			AppButton,
		},
		props: {
			loading: {
				type: Boolean,
				default: false,
			},
			disabled: {
				type: Boolean,
				default: false,
			},
			errorMessage: {
				type: String,
				default: "",
			},
			successMessage: {
				type: String,
				default: "",
			},
			submitButtonText: {
				type: String,
				default: "Submit",
			},
			submitButtonType: {
				type: String,
				default: "submit",
			},
			submitButtonColor: {
				type: String,
				default: "primary",
			},
			submitButtonVariant: {
				type: String,
				default: "elevated",
			},
			submitButtonBlock: {
				type: Boolean,
				default: false,
			},
			submitButtonClass: {
				type: String,
				default: "mt-4",
			},
			submitAriaLabel: {
				type: String,
				default: "",
			},
			showSubmitButton: {
				type: Boolean,
				default: true,
			},
			alertClass: {
				type: String,
				default: "mt-2",
			},
		},
		emits: ["submit"],
		computed: {
			computedSubmitAriaLabel() {
				if (this.submitAriaLabel) return this.submitAriaLabel
				return this.loading
					? "Submitting..."
					: `Submit ${this.submitButtonText.toLowerCase()}`
			},
		},
		methods: {
			handleSubmit(event) {
				if (event && event.type === "submit") {
					event.preventDefault()
				}
				if (!this.disabled && !this.loading) {
					this.$emit("submit")
				}
			},
		},
	}
</script>

<style scoped>
	.app-form {
		width: 100%;
	}
</style>
