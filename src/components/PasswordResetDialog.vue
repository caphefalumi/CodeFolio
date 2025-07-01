<template>
	<app-dialog
		v-model="isOpen"
		title="Reset Password"
		max-width="420"
		toolbar-color="warning"
		@close="closeDialog"
	>
		<v-stepper v-model="currentStep" flat class="mb-2">
			<v-stepper-header>
				<v-stepper-step :complete="currentStep > 1" step="1"
					>Send Code</v-stepper-step
				>
				<v-divider></v-divider>
				<v-stepper-step :complete="currentStep > 2" step="2"
					>Verify Code</v-stepper-step
				>
				<v-divider></v-divider>
				<v-stepper-step step="3">New Password</v-stepper-step>
			</v-stepper-header>
		</v-stepper>

		<!-- Step 1: Send Reset Code -->
		<app-form
			v-if="currentStep === 1"
			:loading="loading"
			:error-message="errorMessage"
			:success-message="successMessage"
			submit-button-text="Send Reset Code"
			:submit-button-block="true"
			@submit="sendResetCode"
		>
			<p class="text-body-2 mb-4">
				A reset code will be sent to: <strong>{{ userEmail }}</strong>
			</p>
		</app-form>

		<!-- Step 2: Verify Code -->
		<app-form
			v-if="currentStep === 2"
			:loading="loading"
			:error-message="errorMessage"
			:success-message="successMessage"
			submit-button-text="Verify Code"
			:submit-button-block="true"
			@submit="verifyCode"
		>
			<v-text-field
				v-model="resetCode"
				label="6-digit Code"
				required
				aria-label="Enter the 6-digit verification code sent to your email"
				autocomplete="one-time-code"
			></v-text-field>
		</app-form>

		<!-- Step 3: Set New Password -->
		<app-form
			v-if="currentStep === 3"
			:loading="loading"
			:error-message="errorMessage"
			:success-message="successMessage"
			submit-button-text="Set New Password"
			:submit-button-block="true"
			@submit="resetPassword"
		>
			<v-text-field
				v-model="newPassword"
				label="New Password"
				type="password"
				required
				aria-label="Enter your new password"
				autocomplete="new-password"
			></v-text-field>
			<v-text-field
				v-model="confirmPassword"
				label="Retype New Password"
				type="password"
				required
				aria-label="Confirm your new password by typing it again"
				autocomplete="new-password"
			></v-text-field>
		</app-form>

		<template #actions>
			<v-spacer></v-spacer>
			<app-button text @click="closeDialog">Close</app-button>
		</template>
	</app-dialog>
</template>

<script>
	import { useApi } from "@/composables/common.js"
	import AppDialog from "./AppDialog.vue"
	import AppForm from "./AppForm.vue"
	import AppButton from "./AppButton.vue"
	import axios from "axios"

	export default {
		name: "PasswordResetDialog",
		components: {
			AppDialog,
			AppForm,
			AppButton,
		},
		props: {
			modelValue: {
				type: Boolean,
				default: false,
			},
			userEmail: {
				type: String,
				required: true,
			},
		},
		emits: ["update:modelValue", "success"],
		data() {
			return {
				currentStep: 1,
				resetCode: "",
				newPassword: "",
				confirmPassword: "",
				loading: false,
				errorMessage: "",
				successMessage: "",
			}
		},
		setup() {
			const { handleError } = useApi()
			return { handleError }
		},
		computed: {
			isOpen: {
				get() {
					return this.modelValue
				},
				set(value) {
					this.$emit("update:modelValue", value)
				},
			},
		},
		methods: {
			async sendResetCode() {
				this.loading = true
				this.errorMessage = ""
				this.successMessage = ""
				try {
					const token = sessionStorage.getItem("accessToken")
					const res = await axios.post(
						`${import.meta.env.VITE_SERVER_URL}/api/auth/forgot-password`,
						{},
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					)
					this.successMessage = res.data.message
					this.currentStep = 2
				} catch (err) {
					this.handleError(err)
					this.errorMessage = err.response?.data?.message || err.message
				} finally {
					this.loading = false
				}
			},

			async verifyCode() {
				this.loading = true
				this.errorMessage = ""
				this.successMessage = ""
				try {
					const token = sessionStorage.getItem("accessToken")
					const res = await axios.post(
						`${import.meta.env.VITE_SERVER_URL}/api/auth/verify-reset-code`,
						{
							code: this.resetCode,
						},
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					)
					this.successMessage = res.data.message
					this.currentStep = 3
				} catch (err) {
					this.errorMessage = err.response?.data?.message || err.message
				} finally {
					this.loading = false
				}
			},

			async resetPassword() {
				if (this.newPassword !== this.confirmPassword) {
					this.errorMessage = "Passwords do not match"
					return
				}

				this.loading = true
				this.errorMessage = ""
				this.successMessage = ""

				try {
					const token = sessionStorage.getItem("accessToken")
					const res = await axios.post(
						`${import.meta.env.VITE_SERVER_URL}/api/auth/reset-password`,
						{
							code: this.resetCode,
							newPassword: this.newPassword,
						},
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					)

					this.successMessage = res.data.message
					this.$emit("success")

					// Close dialog after success
					setTimeout(() => {
						this.closeDialog()
					}, 2000)
				} catch (err) {
					this.errorMessage = err.response?.data?.message || err.message
				} finally {
					this.loading = false
				}
			},

			closeDialog() {
				this.isOpen = false
				this.resetForm()
			},

			resetForm() {
				this.currentStep = 1
				this.resetCode = ""
				this.newPassword = ""
				this.confirmPassword = ""
				this.errorMessage = ""
				this.successMessage = ""
			},
		},
	}
</script>
