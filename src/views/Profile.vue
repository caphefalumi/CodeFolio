<template>
	<v-theme-provider>
		<!-- Show NotFound if user doesn't exist -->
		<NotFound v-if="showNotFound" />

		<!-- Show main profile content if user exists -->
		<v-container v-else class="py-8">
			<section aria-labelledby="profile-heading">
				<!-- User Profile Section at Top -->
				<v-row class="profile-header" align="center" justify="center">
					<v-col cols="12" class="d-flex flex-column align-center">
						<v-avatar size="120" class="profile-avatar elevation-4 mb-4">
							<v-img
								:src="userProfile.avatar"
								:alt="`${userProfile.firstName} ${userProfile.lastName} profile picture`"
								cover
							></v-img>
						</v-avatar>
						<h1 id="profile-heading" class="text-h4 font-weight-bold mb-1">
							{{
								userProfile.firstName + " " + userProfile.lastName ||
								"Loading..."
							}}
						</h1>
						<div class="text-subtitle-2 text-grey-darken-1 mb-2">
							@{{ userProfile.username }}
						</div>
						<div class="text-body-1 mb-2 text-center">
							{{ userProfile.bio }}
						</div>
						<div v-if="isOwner && currentUser" class="mb-2">
							<v-icon size="18" class="mr-1" aria-hidden="true"
								>mdi-email</v-icon
							>
							<span>{{ currentUser.email }}</span>
						</div>
						<div v-if="userProfile.githubUrl" class="mb-2">
							<v-icon size="18" class="mr-1" aria-hidden="true"
								>mdi-github</v-icon
							>
							<a
								:href="userProfile.githubUrl"
								target="_blank"
								rel="noopener noreferrer"
								aria-label="GitHub profile (opens in new tab)"
								>GitHub</a
							>
						</div>
						<div class="d-flex gap-2 mb-2">
							<v-chip
								color="primary"
								class="mr-2"
								label
								@click="openFollowersDialog('followers')"
								style="cursor: pointer"
							>
								<v-icon left size="18" aria-hidden="true"
									>mdi-account-multiple</v-icon
								>
								<span
									>{{ userProfile.followersCount || 0 }}
									{{ $t("followers") }}</span
								>
							</v-chip>
							<v-chip
								color="secondary"
								label
								@click="openFollowersDialog('following')"
								style="cursor: pointer"
							>
								<v-icon left size="18" aria-hidden="true"
									>mdi-account-plus</v-icon
								>
								<span
									>{{ userProfile.followingCount || 0 }}
									{{ $t("following") }}</span
								>
							</v-chip>
						</div>
						<div class="d-flex gap-2 mt-2">
							<v-btn
								v-if="isOwner"
								color="primary"
								variant="outlined"
								@click="showEditProfile = true"
								>{{ $t("editProfile") }}</v-btn
							>
							<v-btn
								v-if="isOwner"
								color="warning"
								variant="outlined"
								@click="showResetPassword = true"
								>{{ $t("profileResetPassword") }}</v-btn
							>
							<follow-button
								v-if="!isOwner && currentUser"
								:user-id="userProfile._id"
								:initial-following="userProfile.isFollowing"
								@follow-changed="handleFollowChanged"
							/>
						</div>
					</v-col>
				</v-row>

				<!-- Projects Section Below -->
				<v-row class="mt-8">
					<v-col cols="12">
						<section aria-labelledby="projects-section-heading">
							<v-card class="elevation-2 pa-6 profile-projects-card">
								<v-toolbar color="primary" dark flat class="rounded-lg mb-4">
									<v-toolbar-title
										id="projects-section-heading"
										class="text-h5"
										>{{ $t("myProjects") }}</v-toolbar-title
									>
									<v-spacer></v-spacer>
									<v-btn
										v-if="isOwner"
										color="white"
										variant="text"
										@click="openNewProjectDialog"
										aria-label="Add a new project"
									>
										<v-icon left aria-hidden="true">mdi-plus</v-icon>
										{{ $t("addProject") }}
									</v-btn>
								</v-toolbar>
								<v-row v-auto-animate>
									<v-col
										v-for="project in userProjects"
										:key="project._id"
										cols="12"
										sm="6"
										md="4"
									>
										<article>
											<project-card
												:project="project"
												:show-edit-button="isOwner"
												:show-delete-button="isOwner"
												@view="viewProject"
												@edit="editProject"
												@delete="deleteProject"
											/>
										</article>
									</v-col>
								</v-row>
							</v-card>
						</section>
					</v-col>
				</v-row>
			</section>

			<!-- Edit Profile Dialog -->
			<app-dialog
				v-model="showEditProfile"
				:title="$t('editProfile')"
				:fullscreen="true"
				:scrollable="true"
				transition="dialog-bottom-transition"
				card-class="pa-0"
				content-class="py-6 px-2 px-md-12"
				@close="showEditProfile = false"
			>
				<v-container style="max-width: 600px; margin: auto">
					<div class="d-flex flex-column align-center mb-4">
						<v-avatar size="96" class="mb-2">
							<v-img
								:src="userProfile.avatar"
								:alt="`Current profile picture`"
								cover
							></v-img>
						</v-avatar>
						<app-button
							size="small"
							color="primary"
							variant="text"
							prepend-icon="mdi-camera"
							aria-label="Change profile photo. Click to upload a new profile picture"
							@click="$refs.avatarInput.click()"
						>
							{{ $t("changePhoto") }}
						</app-button>
						<input
							ref="avatarInput"
							type="file"
							accept="image/*"
							style="display: none"
							@change="onAvatarChange"
							aria-label="Choose profile picture file"
						/>
					</div>

					<app-form
						:loading="loading"
						:error-message="errorMessage"
						:success-message="successMessage"
						:submit-button-text="$t('saveChanges')"
						:submit-button-block="true"
						submit-button-class="mt-4"
						:submit-aria-label="
							loading ? 'Saving changes...' : 'Save profile changes'
						"
						aria-labelled-by="edit-profile-heading"
						@submit="handleProfileUpdate"
					>
						<v-text-field
							v-model="editForm.username"
							:label="$t('username')"
							required
							autocomplete="username"
							:error-messages="usernameError"
							maxlength="50"
							@blur="checkUsernameAvailability"
						></v-text-field>
						<v-text-field
							v-model="editForm.firstName"
							:label="$t('firstName')"
							required
							autocomplete="given-name"
							maxlength="50"
						></v-text-field>
						<v-text-field
							v-model="editForm.lastName"
							:label="$t('lastName')"
							required
							autocomplete="family-name"
							maxlength="50"
						></v-text-field>
						<v-textarea
							v-model="editForm.bio"
							:label="$t('bio')"
							rows="3"
							maxlength="500"
							counter
							aria-label="Bio - Write a brief description about yourself"
						></v-textarea>
					</app-form>
				</v-container>
			</app-dialog>

			<!-- New Project Dialog -->
			<app-dialog
				v-model="showNewProject"
				:title="$t('addNewProject')"
				max-width="800"
				@close="closeProjectDialog"
			>
				<app-form
					:loading="loading"
					:error-message="projectErrorMessage"
					:submit-button-text="$t('saveProject')"
					:submit-aria-label="loading ? 'Saving project...' : 'Save project'"
					aria-labelled-by="new-project-heading"
					:show-submit-button="false"
					@submit="saveProject"
				>
					<v-text-field
						v-model="projectForm.title"
						:label="$t('projectTitle')"
						:rules="projectValidationRules.title"
						required
						maxlength="100"
						counter
						aria-label="Enter a descriptive title for your project"
					></v-text-field>
					<v-textarea
						v-model="projectForm.description"
						:label="$t('projectDescription')"
						:rules="projectValidationRules.description"
						required
						maxlength="500"
						counter
						aria-label="Provide a brief description of what your project does"
					></v-textarea>

					<!-- Quill Editor for Project Content -->
					<div class="mb-4">
						<label class="v-label v-field-label"></label>
						<quill-editor
							v-model="projectForm.content"
							placeholder="Write detailed content about your project, including features and implementation details..."
							min-height="200px"
						/>
						<div v-if="contentError" class="text-error text-caption mt-1">
							{{ contentError }}
						</div>
					</div>

					<v-file-input
						v-model="projectForm.coverImage"
						:label="$t('coverImage')"
						accept="image/*"
						prepend-icon="mdi-image"
						aria-label="Upload a cover image that represents your project"
					></v-file-input>
					<v-combobox
						v-model="projectForm.tags"
						:label="$t('tags')"
						multiple
						chips
						small-chips
						aria-label="Add tags to help categorize your project. You can create new tags by typing and pressing enter."
					></v-combobox>
					<v-text-field
						v-model="projectForm.githubUrl"
						:label="$t('githubUrl')"
						:rules="projectValidationRules.githubUrl"
						prepend-icon="mdi-github"
						type="url"
						maxlength="255"
						aria-label="Enter the URL of your GitHub repository for this project"
					></v-text-field>
					<v-select
						v-model="projectForm.type"
						:items="projectTypes"
						:label="$t('projectType')"
						:rules="projectValidationRules.type"
						required
						aria-label="Select the type of project you are adding"
					></v-select>
				</app-form>

				<template #actions>
					<v-spacer></v-spacer>
					<app-button
						color="primary"
						:loading="loading"
						:disabled="!isProjectFormValid"
						:aria-label="loading ? 'Saving project...' : 'Save project'"
						@click="saveProject"
					>
						{{ $t("saveProject") }}
					</app-button>
				</template>
			</app-dialog>
			<!-- Password Reset Dialog -->
			<forgot-password-dialog
				v-model="showResetPassword"
				:user-email="currentUser?.email"
				:skip-email-step="true"
				@success="handlePasswordResetSuccess"
			/>

			<!-- Followers Dialog -->
			<followers-dialog
				v-model="showFollowersDialog"
				:user-id="userProfile._id"
				:type="followersDialogType"
				@close="showFollowersDialog = false"
			/>

			<app-alert
				v-if="errorMessage"
				type="error"
				:message="errorMessage"
				custom-class="mb-4"
			/>
		</v-container>
	</v-theme-provider>
</template>

<script>
	import {
		fetchProfile,
		fetchProjects,
		fetchCurrentUser,
		getAccessToken,
	} from "@/composables/user.js"
	import { useApi } from "@/composables/common.js"
	import axios from "axios"
	// Import reusable components
	import AppDialog from "@/components/AppDialog.vue"
	import AppButton from "@/components/AppButton.vue"
	import AppForm from "@/components/AppForm.vue"
	import AppAlert from "@/components/AppAlert.vue"
	import ProjectCard from "@/components/ProjectCard.vue"
	import QuillEditor from "@/components/QuillEditor.vue"
	import ForgotPasswordDialog from "@/components/ForgotPasswordDialog.vue"
	import FollowButton from "@/components/FollowButton.vue"
	import FollowersDialog from "@/components/FollowersDialog.vue"
	import NotFound from "@/views/NotFound.vue"

	export default {
		name: "ProfileView",
		components: {
			AppDialog,
			AppButton,
			AppForm,
			AppAlert,
			ProjectCard,
			QuillEditor,
			ForgotPasswordDialog,
			FollowButton,
			FollowersDialog,
			NotFound,
		},
		data() {
			return {
				// Error state
				showNotFound: false,

				// Existing data
				userProfile: {},
				userProjects: [],
				currentUser: null,
				showEditProfile: false,
				showNewProject: false,
				loading: false,
				isOwner: false,
				editForm: {
					firstName: "",
					lastName: "",
					bio: "",
					avatar: null,
					avatarPreview: null,
					username: "",
				},
				successMessage: "",
				projectForm: {
					title: "",
					description: "",
					content: "",
					coverImage: null,
					tags: [],
					githubUrl: "",
					type: "",
				},
				errorMessage: "",
				projectTypes: [],
				showResetPassword: false,
				usernameError: "",
				showFollowersDialog: false,
				followersDialogType: "followers", // 'followers' or 'following'
				projectErrorMessage: "",
				contentError: "",
				projectValidationRules: {},
			}
		},
		setup() {
			const {
				uploadImage,
				updateUser,
				createPost,
				updatePost,
				deletePost,
				getErrorMessage,
			} = useApi()

			return {
				uploadImage,
				updateUser,
				createPost,
				updatePost,
				deletePost,
				getErrorMessage,
			}
		},
		computed: {
			accessToken() {
				return getAccessToken()
			},
			isProjectFormValid() {
				const titleValid =
					this.projectForm.title &&
					this.projectForm.title.length >= 3 &&
					this.projectForm.title.length <= 100

				const descriptionValid =
					this.projectForm.description &&
					this.projectForm.description.length >= 10 &&
					this.projectForm.description.length <= 500

				const typeValid = !!this.projectForm.type

				const contentValid =
					this.projectForm.content && this.projectForm.content.trim().length > 0

				const githubUrlValid =
					!this.projectForm.githubUrl ||
					this.isValidUrl(this.projectForm.githubUrl)

				return (
					titleValid &&
					descriptionValid &&
					typeValid &&
					contentValid &&
					githubUrlValid
				)
			},
		},
		methods: {
			initializeTranslatedData() {
				// Initialize project types
				this.projectTypes = [
					this.$t("projectTypeWebDevelopment"),
					this.$t("projectTypeMobileApp"),
					this.$t("projectTypeApiDevelopment"),
					this.$t("projectTypeOther"),
				] // Initialize validation rules
				this.projectValidationRules = {
					title: [
						v => !!v || this.$t("validationRequired"),
						v => (v && v.length >= 3) || this.$t("validationTitleMinLength"),
						v => (v && v.length <= 100) || this.$t("validationTitleMaxLength"),
					],
					description: [
						v => !!v || this.$t("validationRequired"),
						v =>
							(v && v.length >= 10) ||
							this.$t("validationDescriptionMinLength"),
						v =>
							(v && v.length <= 500) ||
							this.$t("validationDescriptionMaxLength"),
					],
					type: [v => !!v || this.$t("validationRequired")],
					githubUrl: [
						v => !v || this.isValidUrl(v) || this.$t("validationUrlInvalid"),
					],
				}
			},
			async fetchProfileAndProjects(username) {
				// Reset error state
				this.showNotFound = false

				try {
					// 1. Get public user profile by username
					const profile = await fetchProfile(username)

					// Check if profile exists
					if (!profile) {
						this.showNotFound = true
						return
					}

					this.userProfile = profile

					// 2. Try to get current logged-in user (optional)
					try {
						this.currentUser = await fetchCurrentUser()
						this.isOwner = this.currentUser?._id === profile._id
					} catch (err) {
						console.warn("Not logged in or failed to fetch current user:", err)
						this.currentUser = null
						this.isOwner = false
					}

					// 3. Fill edit form fields
					this.editForm.firstName = profile.firstName || ""
					this.editForm.lastName = profile.lastName || ""
					this.editForm.bio = profile.bio
					this.editForm.avatar = null
					this.editForm.avatarPreview = profile.avatar
					this.editForm.username = profile.username || ""

					// 4. Fetch user's projects
					this.userProjects = await fetchProjects(username)
				} catch (err) {
					console.error("Error loading profile or projects:", err)
					// Check if it's a 404 error (user not found)
					if (err.response && err.response.status === 404) {
						this.showNotFound = true
					} else {
						// For other errors, still show NotFound to avoid broken page
						this.showNotFound = true
					}
				}
			},

			onAvatarChange(e) {
				const file = e.target.files[0]
				if (file) {
					this.editForm.avatar = file
					this.editForm.avatarPreview = URL.createObjectURL(file)
				}
			},

			async checkUsernameAvailability() {
				this.usernameError = ""
				const newUsername = this.editForm.username?.trim()
				if (!newUsername || newUsername === this.userProfile.username) return

				try {
					const res = await axios.get(
						`${import.meta.env.VITE_SERVER_URL}/api/users/${newUsername}`
					)
					if (res.status === 200 && res.data) {
						this.usernameError = this.$t("usernameExists")
					}
				} catch (error) {
					// Username is available if we get a 404
					if (error.response?.status !== 404) {
						console.error("Error checking username:", error)
					}
				}
			},

			async handleProfileUpdate() {
				this.errorMessage = ""
				this.successMessage = ""
				this.loading = true
				this.usernameError = ""
				await this.checkUsernameAvailability()
				if (this.usernameError) {
					this.loading = false
					return
				}
				try {
					let avatarUri = this.editForm.avatar
					if (avatarUri && typeof avatarUri === "object") {
						avatarUri = await this.uploadImage(
							avatarUri,
							`${import.meta.env.VITE_SERVER_URL}/api/upload/image/profile`,
							this.accessToken
						)
					} else {
						avatarUri = this.userProfile.avatar
					}
					const payload = {
						firstName: this.editForm.firstName,
						lastName: this.editForm.lastName,
						bio: this.editForm.bio,
						avatar: avatarUri,
						username: this.editForm.username,
					}
					await this.updateUser(payload, this.accessToken)
					this.successMessage = this.$t("profileUpdated")
					this.fetchProfileAndProjects(this.editForm.username)
					setTimeout(() => {
						this.showEditProfile = false
						this.successMessage = ""
					}, 1200)
				} catch (error) {
					this.errorMessage = this.getErrorMessage(
						error,
						"Failed to update profile. Please try again."
					)
				} finally {
					this.loading = false
				}
			},

			async saveProject() {
				// Clear previous errors
				this.projectErrorMessage = ""
				this.contentError = ""

				// Validate the form
				if (!this.validateProjectForm()) {
					return
				}

				this.loading = true
				try {
					let imageUri = this.projectForm.coverImage

					if (imageUri && typeof imageUri === "object") {
						imageUri = await this.uploadImage(
							imageUri,
							`${import.meta.env.VITE_SERVER_URL}/api/upload/image/blog`,
							this.accessToken
						)
					}

					const payload = {
						title: this.projectForm.title,
						description: this.projectForm.description,
						content: this.projectForm.content,
						coverImage: imageUri,
						tags: this.projectForm.tags,
						githubUrl: this.projectForm.githubUrl,
						type: this.projectForm.type,
					}

					let result
					if (this.projectForm._id) {
						result = await this.updatePost(
							this.projectForm._id,
							payload,
							this.accessToken
						)
						const index = this.userProjects.findIndex(p => p._id === result._id)
						if (index !== -1) {
							this.userProjects.splice(index, 1, result)
						}
					} else {
						result = await this.createPost(payload, this.accessToken)
						this.userProjects.push(result)
					}

					this.showNewProject = false
					this.resetProjectForm()
				} catch (error) {
					this.projectErrorMessage = this.getErrorMessage(
						error,
						"Project save failed"
					)
				} finally {
					this.loading = false
				}
			},

			viewProject(project) {
				this.$router.push(`/${this.userProfile.username}/${project.id}`)
			},
			editProject(project) {
				this.projectForm = { ...project }
				this.showNewProject = true
			},

			openNewProjectDialog() {
				this.resetProjectForm()
				this.showNewProject = true
			},

			closeProjectDialog() {
				this.showNewProject = false
				this.resetProjectForm()
			},

			async deleteProject(project) {
				if (confirm(this.$t("deleteConfirm"))) {
					this.loading = true
					try {
						await this.deletePost(project._id, this.accessToken)
						this.userProjects = this.userProjects.filter(
							p => p._id !== project._id
						)
					} catch (error) {
						this.errorMessage = this.getErrorMessage(
							error,
							"Project deletion failed"
						)
					} finally {
						this.loading = false
					}
				}
			},

			resetProjectForm() {
				this.projectForm = {
					title: "",
					description: "",
					content: "",
					coverImage: null,
					tags: [],
					githubUrl: "",
					type: "",
				}
			},

			handlePasswordResetSuccess(message) {
				this.successMessage = message
				setTimeout(() => {
					this.successMessage = ""
				}, 3000)
			},

			openFollowersDialog(type) {
				this.followersDialogType = type
				this.showFollowersDialog = true
			},

			handleFollowChanged(isFollowing) {
				// Update the follow counts when follow status changes
				if (isFollowing) {
					this.userProfile.followersCount =
						(this.userProfile.followersCount || 0) + 1
				} else {
					this.userProfile.followersCount = Math.max(
						(this.userProfile.followersCount || 0) - 1,
						0
					)
				}
				this.userProfile.isFollowing = isFollowing
			},

			// Validation helper methods
			validateProjectForm() {
				let isValid = true

				// Validate content (since it's not using v-text-field rules)
				if (
					!this.projectForm.content ||
					this.projectForm.content.trim().length === 0
				) {
					this.contentError = this.$t("validationRequired")
					isValid = false
				} else {
					this.contentError = ""
				}

				// Set general error message if form is invalid
				if (!isValid) {
					this.projectErrorMessage = this.$t("requiredFields")
				}

				return isValid
			},

			isValidUrl(string) {
				try {
					new URL(string)
					return true
				} catch (_) {
					return false
				}
			},
		},

		mounted() {
			// Initialize translated data after component is mounted
			this.initializeTranslatedData()

			// Load profile data
			const username = this.$route.params.username
			this.fetchProfileAndProjects(username)
		},

		watch: {
			$route(to, from) {
				// When the route changes, reload the profile data
				if (to.params.username !== from.params.username) {
					console.log("Route changed, loading new profile:", to.params.username)
					this.fetchProfileAndProjects(to.params.username)
				}
			},
		},
	}
</script>

<style scoped>
	.profile-header {
		margin-bottom: 32px;
	}
	.profile-avatar {
		border: 4px solid #fff;
		box-shadow: 0 4px 24px rgba(44, 62, 80, 0.15);
	}
	.profile-projects-card {
		border-radius: 18px;
		background: var(--v-theme-surface);
	}
	.project-card {
		border-radius: 12px;
		transition: box-shadow 0.2s;
	}
	.project-card:hover {
		box-shadow: 0 8px 32px rgba(44, 62, 80, 0.18);
	}
</style>
