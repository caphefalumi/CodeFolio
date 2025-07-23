<template>
	<app-dialog
		v-model="isOpen"
		:title="$t('forgotPasswordTitle')"
		max-width="420"
		toolbar-color="warning"
		@close="closeDialog"
	>
		<!-- Stepper header replaced for Vuetify 3.x compatibility -->
		<div class="mb-2 d-flex flex-row justify-center align-center">
			<div
				v-if="!skipEmailStep"
				:class="['step', { complete: currentStep > 1 }]"
			>
				{{ $t("sendResetCode") }}
			</div>
			<div v-if="!skipEmailStep" class="step-divider"></div>
			<div
				:class="['step', { complete: currentStep > (skipEmailStep ? 1 : 2) }]"
			>
				{{ $t("verifyResetCode") }}
			</div>
			<div class="step-divider"></div>
			<div
				:class="['step', { complete: currentStep > (skipEmailStep ? 2 : 3) }]"
			>
				{{ $t("setNewPassword") }}
			</div>
		</div>

		<app-form
			v-if="currentStep === 1 && !skipEmailStep"
			:loading="loading"
			:error-message="errorMessage"
			:success-message="successMessage"
			:submit-button-text="$t('sendResetCode')"
			:submit-button-block="true"
			:disabled="!isFormValid || loading"
			@submit="sendResetCode"
		>
			<p class="text-body-2 mb-4">
				{{ $t("forgotPasswordSubtitle") }}
			</p>
			<v-text-field
				v-model="email"
				:label="$t('email')"
				type="email"
				required
				:rules="[rules.required, rules.email]"
				aria-label="Enter your email address to receive a reset code"
				autocomplete="email"
				maxlength="255"
			></v-text-field>
		</app-form>

		<app-form
			v-if="
				(currentStep === 2 && !skipEmailStep) ||
				(currentStep === 1 && skipEmailStep)
			"
			:loading="loading"
			:error-message="errorMessage"
			:success-message="successMessage"
			:submit-button-text="$t('verifyResetCode')"
			:submit-button-block="true"
			:disabled="!isFormValid || loading"
			@submit="verifyCode"
		>
			<p class="text-body-2 mb-4">
				{{
					skipEmailStep
						? $t("resetCodeSent") + " " + userEmail
						: $t("resetCodeSent")
				}}
			</p>
			<v-text-field
				v-model="resetCode"
				:label="$t('sixDigitCode')"
				required
				inputmode="number"
				aria-label="Enter the 6-digit verification code sent to your email"
				autocomplete="one-time-code"
				maxlength="6"
			></v-text-field>
		</app-form>

		<!-- Step 3: Set New Password (or Step 2 if skipEmailStep is true) -->
		<app-form
			v-if="
				(currentStep === 3 && !skipEmailStep) ||
				(currentStep === 2 && skipEmailStep)
			"
			:loading="loading"
			:error-message="errorMessage"
			:success-message="successMessage"
			:submit-button-text="$t('setNewPassword')"
			:submit-button-block="true"
			:submit-button-disabled="!isFormValid || loading"
			@submit="resetPassword"
		>
			<v-text-field
				v-model="newPassword"
				:label="$t('newPassword')"
				type="password"
				required
				:rules="[rules.required, rules.password]"
				aria-label="Enter your new password"
				autocomplete="new-password"
				maxlength="128"
			></v-text-field>
			<v-text-field
				v-model="confirmPassword"
				:label="$t('confirmNewPassword')"
				type="password"
				required
				:rules="[rules.required, rules.confirmPassword]"
				aria-label="Confirm your new password by typing it again"
				autocomplete="new-password"
				maxlength="128"
			></v-text-field>
		</app-form>

		<template #actions>
			<v-spacer></v-spacer>
			<app-button text @click="closeDialog">{{ $t("close") }}</app-button>
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
		name: "ForgotPasswordDialog",
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
				default: "",
			},
			skipEmailStep: {
				type: Boolean,
				default: false,
			},
		},
		emits: ["update:modelValue", "success"],
		data() {
			return {
				currentStep: 1,
				email: "",
				resetCode: "",
				newPassword: "",
				confirmPassword: "",
				loading: false,
				errorMessage: "",
				successMessage: "",
			}
		},
		watch: {
			modelValue(newVal) {
				if (newVal) {
					this.initializeForm()
				}
			},
		},
		setup() {
			const { getErrorMessage } = useApi()
			return { getErrorMessage }
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
			initialStep() {
				return this.skipEmailStep ? 2 : 1
			},
			rules() {
				return {
					required: v => !!v || this.$t("validationRequired"),
					resetCode: v =>
						/^\d{6}$/.test(v) || this.$t("validationResetCodeInvalid"),
					email: v =>
						/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v) ||
						this.$t("validationEmailInvalid"),
					password: v => {
						if (!v) return this.$t("validationRequired")
						if (v.length < 8) return this.$t("validationPasswordMinLength")
						if (v.length > 128) return this.$t("validationPasswordMaxLength")
						if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(v))
							return this.$t("validationPasswordRequirements")
						return true
					},
					confirmPassword: v =>
						v === this.newPassword || this.$t("validationPasswordsNotMatch"),
				}
			},
			isFormValid() {
				if (this.currentStep === 1 && !this.skipEmailStep) {
					return this.email && this.rules.email(this.email) === true
				} else if (
					(this.currentStep === 2 && !this.skipEmailStep) ||
					(this.currentStep === 1 && this.skipEmailStep)
				) {
					return this.resetCode && this.rules.resetCode(this.resetCode) === true
				} else if (
					(this.currentStep === 3 && !this.skipEmailStep) ||
					(this.currentStep === 2 && this.skipEmailStep)
				) {
					return (
						this.newPassword &&
						this.rules.password(this.newPassword) === true &&
						this.confirmPassword &&
						this.rules.confirmPassword(this.confirmPassword) === true
					)
				}
				return false
			},
		},
		methods: {
			initializeForm() {
				this.currentStep = this.skipEmailStep ? 1 : 1
				this.email = this.userEmail || ""
				this.resetCode = ""
				this.newPassword = ""
				this.confirmPassword = ""
				this.errorMessage = ""
				this.successMessage = ""

				// If skipEmailStep is true, immediately send reset code
				if (this.skipEmailStep && this.userEmail) {
					this.sendResetCode()
				}
			},
			async sendResetCode() {
				this.loading = true
				this.errorMessage = ""
				this.successMessage = ""
				try {
					let res
					if (this.skipEmailStep) {
						// Use authenticated endpoint for logged-in users
						const token = sessionStorage.getItem("accessToken")
						res = await axios.post(
							`${import.meta.env.VITE_SERVER_URL}/api/auth/forgot-password`,
							{},
							{
								headers: { Authorization: `Bearer ${token}` },
							}
						)
						this.successMessage = this.$t("resetCodeSent")
						this.currentStep = 1 // Move to verify code step
					} else {
						// Use non-authenticated endpoint for login page
						res = await axios.post(
							`${import.meta.env.VITE_SERVER_URL}/api/auth/forgot-password-email`,
							{
								email: this.email,
							}
						)
						this.successMessage = this.$t("resetCodeSent")
						this.currentStep = 2 // Move to verify code step
					}
				} catch (err) {
					this.errorMessage = this.getErrorMessage(
						err,
						"Failed to send reset code"
					)
				} finally {
					this.loading = false
				}
			},

			async verifyCode() {
				this.loading = true
				this.errorMessage = ""
				this.successMessage = ""
				try {
					let res
					if (this.skipEmailStep) {
						// Use authenticated endpoint for logged-in users
						const token = sessionStorage.getItem("accessToken")
						res = await axios.post(
							`${import.meta.env.VITE_SERVER_URL}/api/auth/verify-reset-code`,
							{
								code: this.resetCode,
							},
							{
								headers: { Authorization: `Bearer ${token}` },
							}
						)
						this.successMessage = res.data.message
						this.currentStep = 2 // Move to password reset step
					} else {
						// Use non-authenticated endpoint for login page
						res = await axios.post(
							`${import.meta.env.VITE_SERVER_URL}/api/auth/verify-reset-code-email`,
							{
								email: this.email,
								code: this.resetCode,
							}
						)
						this.successMessage = res.data.message
						this.currentStep = 3 // Move to password reset step
					}
				} catch (err) {
					this.errorMessage = this.getErrorMessage(err, "Failed to verify code")
				} finally {
					this.loading = false
				}
			},

			async resetPassword() {
				if (this.newPassword !== this.confirmPassword) {
					this.errorMessage = this.$t("validationPasswordsNotMatch")
					return
				}

				this.loading = true
				this.errorMessage = ""
				this.successMessage = ""

				try {
					let res
					if (this.skipEmailStep) {
						// Use authenticated endpoint for logged-in users
						const token = sessionStorage.getItem("accessToken")
						res = await axios.post(
							`${import.meta.env.VITE_SERVER_URL}/api/auth/reset-password`,
							{
								code: this.resetCode,
								newPassword: this.newPassword,
							},
							{
								headers: { Authorization: `Bearer ${token}` },
							}
						)
					} else {
						// Use non-authenticated endpoint for login page
						res = await axios.post(
							`${import.meta.env.VITE_SERVER_URL}/api/auth/reset-password-email`,
							{
								email: this.email,
								code: this.resetCode,
								newPassword: this.newPassword,
							}
						)
					}

					this.successMessage = res.data.message
					this.$emit("success", res.data.message)

					// Close dialog after success
					setTimeout(() => {
						this.closeDialog()
					}, 1000)
				} catch (err) {
					this.errorMessage = this.getErrorMessage(
						err,
						"Failed to reset password"
					)
				} finally {
					this.loading = false
				}
			},

			closeDialog() {
				this.isOpen = false
				this.errorMessage = ""
				this.successMessage = ""
			},
		},
	}
</script>

<style scoped>
	.step {
		padding: 0.5rem 1rem;
		border-radius: 8px;
		background: #f5f5f5;
		margin: 0 0.25rem;
		font-weight: 500;
		color: #888;
	}
	.step.complete {
		background: #ffe082;
		color: #333;
	}
	.step-divider {
		width: 32px;
		height: 2px;
		background: #ffe082;
		margin: 0 0.25rem;
		align-self: center;
	}
</style>
