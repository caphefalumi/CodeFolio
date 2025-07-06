<template>
	<v-container>
		<v-row justify="center">
			<v-col cols="12" sm="8" md="6">
				<v-card class="mt-8">
					<v-card-title class="text-h4 text-center pt-6" id="login-heading">{{
						$t("loginTitle")
					}}</v-card-title>
					<v-card-text>
						<app-form
							:loading="loading"
							:error-message="errorMessage"
							:submit-button-text="$t('signIn')"
							:submit-button-block="true"
							submit-button-class="mt-4"
							aria-labelled-by="login-heading"
							:disabled="isAnyLoading"
							@submit="handleLogin"
						>
							<v-text-field
								v-model="form.email"
								:label="$t('email')"
								type="email"
								required
								:rules="[rules.required, rules.email]"
								autocomplete="email"
								:disabled="isAnyLoading"
							></v-text-field>
							<v-text-field
								v-model="form.password"
								:label="$t('password')"
								type="password"
								required
								:rules="[rules.required]"
								autocomplete="current-password"
								:disabled="isAnyLoading"
							></v-text-field>
						</app-form>
						<v-divider class="my-4" aria-hidden="true"></v-divider>
						<div class="text-center text-body-2 mb-2">
							<span>{{ $t("orLoginWith") }}</span>
						</div>
						<div class="login-buttons">
							<GoogleLogin
								:callback="handleGoogleLogin"
								auto-login
								popup-type="TOKEN"
								:disabled="isAnyLoading"
							>
								<v-icon-login
									provider="google"
									:loading="googleLoading"
									:disabled="isAnyLoading"
								/>
							</GoogleLogin>
							<div class="login-btn-wrapper">
								<v-icon-login
									provider="github"
									:loading="githubLoading"
									:disabled="isAnyLoading"
									@click="!isAnyLoading && handleGithubLogin()"
								/>
							</div>
						</div>
						<div class="text-center mt-4">
							<router-link
								to="/register"
								class="text-decoration-none"
								:class="{ 'pointer-events-none text-grey': isAnyLoading }"
							>
								{{ $t("noAccount") }} {{ $t("signUp") }}
							</router-link>
						</div>
						<div class="text-center mt-2">
							<v-btn
								variant="text"
								color="primary"
								size="small"
								:disabled="isAnyLoading"
								@click="showForgotPassword = true"
							>
								{{ $t("forgotPassword") }}
							</v-btn>
						</div>
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>

		<!-- Forgot Password Dialog -->
		<forgot-password-dialog
			v-model="showForgotPassword"
			@success="handleForgotPasswordSuccess"
		/>
	</v-container>
</template>

<script>
	import { GoogleLogin } from "vue3-google-login"
	import axios from "axios"
	import vIconLogin from "@/components/vIconLogin.vue"
	import AppForm from "@/components/AppForm.vue"
	import ForgotPasswordDialog from "@/components/ForgotPasswordDialog.vue"
	import { useApi } from "@/composables/common.js"

	export default {
		components: {
			GoogleLogin,
			vIconLogin,
			AppForm,
			ForgotPasswordDialog,
		},
		setup() {
			const { getErrorMessage } = useApi()
			return { getErrorMessage }
		},
		data() {
			return {
				loading: false,
				googleLoading: false,
				githubLoading: false,
				errorMessage: "",
				showForgotPassword: false,
				form: {
					email: "",
					password: "",
				},
			}
		},
		computed: {
			rules() {
				return {
					required: v => !!v || this.$t("validationRequired"),
					email: v =>
						/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v) ||
						this.$t("validationEmailInvalid"),
				}
			},
			isAnyLoading() {
				return this.loading || this.googleLoading || this.githubLoading
			},
		},
		mounted() {
			window.addEventListener("message", this.receiveGithubToken)
		},
		beforeUnmount() {
			window.removeEventListener("message", this.receiveGithubToken)
		},
		methods: {
			async handleLogin() {
				this.errorMessage = ""
				this.loading = true
				try {
					const response = await axios.post(
						`${import.meta.env.VITE_SERVER_URL}/api/auth/login/jwt`,
						{
							email: this.form.email,
							password: this.form.password,
						},
						{ withCredentials: true }
					)
					sessionStorage.setItem("accessToken", response.data.accessToken)
					this.$router.push("/")
				} catch (error) {
					this.errorMessage = this.getErrorMessage(
						error,
						this.$t("invalidCredentials")
					)
				} finally {
					this.loading = false
				}
			},

			async handleGoogleLogin(response) {
				this.errorMessage = ""
				this.googleLoading = true
				try {
					const res = await axios.post(
						`${import.meta.env.VITE_SERVER_URL}/api/auth/login/google`,
						{
							token: response.access_token,
						},
						{ withCredentials: true }
					)
					sessionStorage.setItem("accessToken", res.data.accessToken)
					window.location.href = "/"
				} catch (error) {
					this.errorMessage = this.getErrorMessage(
						error,
						this.$t("googleLogin") + " failed. Please try again."
					)
				} finally {
					this.googleLoading = false
				}
			},
			handleGithubLogin() {
				this.errorMessage = ""
				this.githubLoading = true
				const popup = window.open(
					`${import.meta.env.VITE_SERVER_URL}/api/auth/login/github`,
					"GitHub Login",
					"width=500,height=600"
				)

				// Check if popup is closed without completing login
				const checkClosed = setInterval(() => {
					if (popup.closed) {
						clearInterval(checkClosed)
						// Reset loading state if popup was closed without login
						setTimeout(() => {
							if (this.githubLoading) {
								this.githubLoading = false
							}
						}, 1000)
					}
				}, 1000)
			},
			receiveGithubToken(event) {
				const { accessToken, error: githubError } = event.data || {}
				if (accessToken) {
					sessionStorage.setItem("accessToken", accessToken)
					window.location.href = "/"
				} else if (githubError) {
					this.errorMessage = githubError
					window.location.reload()
				} // Always reset loading state when we receive a message
				this.githubLoading = false
			},
			handleForgotPasswordSuccess(message) {
				// Show success message and optionally redirect to login
				this.errorMessage = ""
				// You could show a success toast here if needed
				console.log("Password reset successful:", message)
			},
		},
	}
</script>

<style scoped>
	.login-buttons {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1em;
	}

	.shrink {
		width: 1px;
	}

	.pointer-events-none {
		pointer-events: none;
	}

	.text-grey {
		color: #999 !important;
	}
</style>
