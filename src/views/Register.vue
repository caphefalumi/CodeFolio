<template>
	<v-container>
		<v-row justify="center">
			<v-col cols="12" sm="8" md="6">
				<v-card class="mt-8">
					<v-card-title
						class="text-h4 text-center pt-6"
						id="register-heading"
						>{{ $t("registerTitle") }}</v-card-title
					>
					<v-card-text>
						<app-form
							:loading="loading"
							:error-message="errorMessage"
							:submit-button-text="$t('register')"
							:submit-button-block="true"
							submit-button-class="mt-4"
							aria-labelled-by="register-heading"
							:disabled="!isFormValid || loading"
							@submit="handleRegister"
						>
							<v-row>
								<v-col cols="6">
									<v-text-field
										v-model="form.firstName"
										:label="$t('firstName')"
										id="register-first-name"
										type="text"
										required
										:rules="[rules.required, rules.name]"
										autocomplete="given-name"
										maxlength="50"
										aria-required="true"
										aria-labelledby="register-first-name-label"
									></v-text-field>
								</v-col>
								<v-col cols="6">
									<v-text-field
										v-model="form.lastName"
										:label="$t('lastName')"
										id="register-last-name"
										type="text"
										required
										:rules="[rules.required, rules.name]"
										autocomplete="family-name"
										maxlength="50"
										aria-required="true"
										aria-labelledby="register-last-name-label"
									></v-text-field>
								</v-col>
							</v-row>
							<v-text-field
								v-model="form.email"
								:label="$t('email')"
								id="register-email"
								type="email"
								required
								:rules="[rules.required, rules.email]"
								autocomplete="email"
								maxlength="255"
								aria-required="true"
								aria-labelledby="register-email-label"
							></v-text-field>
							<v-text-field
								v-model="form.username"
								:label="$t('username')"
								id="register-username"
								type="text"
								required
								:rules="[rules.required, rules.username]"
								autocomplete="username"
								maxlength="50"
								aria-required="true"
								aria-labelledby="register-username-label"
							></v-text-field>
							<v-text-field
								v-model="form.password"
								:label="$t('password')"
								id="register-password"
								type="password"
								required
								:rules="[rules.required, rules.password]"
								autocomplete="new-password"
								maxlength="128"
								aria-required="true"
								aria-labelledby="register-password-label"
							></v-text-field>
							<v-text-field
								v-model="form.confirmPassword"
								:label="$t('confirmPassword')"
								id="register-confirm-password"
								type="password"
								required
								:rules="[rules.required, rules.confirmPassword]"
								autocomplete="new-password"
								maxlength="128"
								aria-required="true"
								aria-labelledby="register-confirm-password-label"
							></v-text-field>
						</app-form>
						<v-snackbar
							v-model="showSuccess"
							color="success"
							top
							rounded="pill"
							timeout="4000"
						>
							{{ $t("registerSuccess") }}
						</v-snackbar>
						<div class="mt-4 text-center">
							{{ $t("alreadyHaveAccount") }}
							<router-link to="/login">{{ $t("login") }}</router-link>
						</div>
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
	import axios from "axios"
	import { GoogleLogin } from "vue3-google-login"
	import AppForm from "@/components/AppForm.vue"
	import { useApi } from "@/composables/common.js"

	export default {
		name: "RegisterComponent",
		components: {
			GoogleLogin,
			AppForm,
		},
		setup() {
			const { getErrorMessage } = useApi()
			return { getErrorMessage }
		},
		data() {
			return {
				loading: false,
				form: {
					firstName: "",
					lastName: "",
					email: "",
					username: "",
					password: "",
					confirmPassword: "",
				},
				errorMessage: "",
				showSuccess: false,
			}
		},
		computed: {
			rules() {
				return {
					required: v => !!v || this.$t("validationRequired"),
					email: v => /.+@.+\..+/.test(v) || this.$t("validationEmailInvalid"),
					username: v => {
						if (!v) return this.$t("validationRequired")
						if (v.length < 3) return this.$t("validationUsernameMinLength")
						if (v.length > 30) return this.$t("validationUsernameMaxLength")
						if (!/^[a-zA-Z0-9_]+$/.test(v))
							return this.$t("validationUsernameInvalid")
						return true
					},
					password: v => {
						if (!v) return this.$t("validationRequired")
						if (v.length < 8) return this.$t("validationPasswordMinLength")
						if (v.length > 128) return this.$t("validationPasswordMaxLength")
						if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(v))
							return this.$t("validationPasswordRequirements")
						return true
					},
					confirmPassword: v =>
						v === this.form.password || this.$t("validationPasswordsNotMatch"),
				}
			},
			isFormValid() {
				return (
					this.rules.email(this.form.email) === true &&
					this.form.username &&
					this.rules.username(this.form.username) === true &&
					this.form.password &&
					this.rules.password(this.form.password) === true &&
					this.form.confirmPassword &&
					this.rules.confirmPassword(this.form.confirmPassword) === true
				)
			},
		},
		methods: {
			async handleRegister() {
				this.errorMessage = ""
				this.loading = true
				try {
					await axios.post(
						`${import.meta.env.VITE_SERVER_URL}/api/auth/register`,
						{
							firstName: this.form.firstName,
							lastName: this.form.lastName,
							email: this.form.email,
							username: this.form.username,
							password: this.form.password,
						}
					)
					this.showSuccess = true
					setTimeout(() => {
						this.$router.push("/login")
					}, 2500)
				} catch (error) {
					if (error.response && error.response.status === 400) {
						if (
							error.response.data.message.includes(
								"Username, email, and password"
							)
						) {
							this.errorMessage = this.$t("validationRequired")
						} else if (
							error.response.data.message.includes("Username already exists")
						) {
							this.errorMessage = this.$t("usernameExists")
						} else if (
							error.response.data.message.includes("Email already exists")
						) {
							this.errorMessage = this.$t("emailExists")
						} else {
							this.errorMessage = error.response.data.message
						}
					} else {
						this.errorMessage = this.getErrorMessage(
							error,
							"Registration failed. Please try again."
						)
					}
				} finally {
					this.loading = false
				}
			},
		},
	}
</script>
