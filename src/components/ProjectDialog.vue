<template>
	<app-dialog
		:modelValue="modelValue"
		@update:modelValue="$emit('update:modelValue', $event)"
		:title="isEditing ? $t('editProject') : $t('addNewProject')"
		max-width="800"
		@close="handleClose"
	>		<app-form
			:loading="loading"
			:error-message="errorMessage"
			:submit-button-text="$t('saveProject')"
			:submit-aria-label="loading ? 'Saving project...' : 'Save project'"
			aria-labelled-by="project-dialog-heading"
			:show-submit-button="false"
			@submit="handleSave"
		>			<v-text-field
				v-model="form.title"
				:label="$t('projectTitle')"
				:rules="titleRules"
				:error-messages="titleError"
				required
				maxlength="100"
				counter
				aria-label="Enter a descriptive title for your project"
			></v-text-field>
			<v-textarea
				v-model="form.description"
				:label="$t('projectDescription')"
				:rules="descriptionRules"
				:error-messages="descriptionError"
				required
				maxlength="500"
				counter
				aria-label="Provide a brief description of what your project does"
			></v-textarea>			<!-- Quill Editor for Project Content -->
			<div class="mb-4">
				<quill-editor
					v-model="form.content"
					placeholder="Write detailed content about your project, including features and implementation details..."
					min-height="200px"
				/>
				<div v-if="contentError" class="text-error text-caption mt-1">
					{{ contentError }}
				</div>
			</div>
			<v-file-input
				v-model="form.coverImage"
				:label="$t('coverImage')"
				accept="image/*"
				prepend-icon="mdi-image"
				aria-label="Upload a cover image that represents your project"
			></v-file-input>			<v-text-field
				v-model="form.githubUrl"
				:label="$t('githubUrl')"
				:rules="githubUrlRules"
				:error-messages="githubUrlError"
				prepend-icon="mdi-github"
				type="url"
				maxlength="255"
				aria-label="Enter the URL of your GitHub repository for this project"
			></v-text-field>
			<v-select
				v-model="form.type"
				:items="projectTypes"
				:label="$t('projectType')"
				:rules="typeRules"
				:error-messages="typeError"
				required
				aria-label="Select the type of project you are adding"
			></v-select>
			<v-combobox
				v-model="form.tags"
				:label="$t('tags')"
				multiple
				chips
				small-chips
				aria-label="Add tags to help categorize your project. You can create new tags by typing and pressing enter."
			></v-combobox>
			<v-row class="mb-2">
				<v-col cols="12">
					<v-btn
						color="secondary"
						variant="outlined"
						@click="showGithubRepoDialog = true"
						v-if="showGithubImport"
					>
						{{ $t("importFromGithub") }}
					</v-btn>
				</v-col>
			</v-row>			<app-dialog
				:modelValue="showGithubRepoDialog"
				@update:modelValue="showGithubRepoDialog = $event"
				:title="'Select a GitHub Repository'"
				max-width="600"
			>
				<v-list>
					<v-list-item
						v-for="repo in githubRepos"
						:key="repo.id"
						@click="importGithubRepo(repo)"
						style="cursor: pointer"
					>
						<v-list-item-title>{{ repo.name }}</v-list-item-title>
						<v-list-item-subtitle>{{ repo.description }}</v-list-item-subtitle>
					</v-list-item>
				</v-list>
				<template #actions>
					<v-spacer></v-spacer>
					<app-button color="primary" @click="showGithubRepoDialog = false">
						{{ $t("close") }}
					</app-button>
				</template>
			</app-dialog>
		</app-form>

		<template #actions>
			<v-spacer></v-spacer>
			<app-button
				color="primary"
				:loading="loading"
				:disabled="!isFormValid"
				:aria-label="loading ? 'Saving project...' : 'Save project'"
				@click="handleSave"
			>
				{{ $t("saveProject") }}
			</app-button>
		</template>
	</app-dialog>
</template>

<script>	import { marked } from "marked"
	import QuillEditor from "@/components/QuillEditor.vue"
	import AppDialog from "@/components/AppDialog.vue"
	import AppButton from "@/components/AppButton.vue"
	import AppForm from "@/components/AppForm.vue"

	export default {
		name: "ProjectDialog",		components: {
			QuillEditor,
			AppDialog,
			AppButton,
			AppForm,
		},
		props: {
			modelValue: {
				type: Boolean,
				default: false,
			},
			project: {
				type: Object,
				default: null,
			},
			loading: {
				type: Boolean,
				default: false,
			},
			githubRepos: {
				type: Array,
				default: () => [],
			},
			showGithubImport: {
				type: Boolean,
				default: false,
			},
		},
		emits: ["update:modelValue", "save", "close"],
		data() {
			return {
				form: {
					title: "",
					description: "",
					content: "",
					coverImage: null,
					tags: [],
					githubUrl: "",
					type: "",
					_id: null,
				},				errorMessage: "",
				contentError: "",
				showGithubRepoDialog: false,
				validationErrors: [],
				titleError: "",
				descriptionError: "",
				typeError: "",
				githubUrlError: "",
				projectTypes: [
					"Web Development",
					"Mobile App",
					"API Development",
					"Game",
					"Design",
					"Data Science",
					"Machine Learning",
					"DevOps",
					"Other",
				],
			}
		},
		computed: {
			isEditing() {
				return this.project && this.project._id
			},
			isFormValid() {
				const titleValid =
					this.form.title &&
					this.form.title.length >= 3 &&
					this.form.title.length <= 100

				const descriptionValid =
					this.form.description &&
					this.form.description.length >= 10 &&
					this.form.description.length <= 500

				const typeValid = !!this.form.type

				const contentValid =
					this.form.content && this.form.content.trim().length > 0

				const githubUrlValid =
					!this.form.githubUrl || this.isValidUrl(this.form.githubUrl)

				return (
					titleValid &&
					descriptionValid &&
					typeValid &&
					contentValid &&
					githubUrlValid
				)
			},			validationRules() {
				return {
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
			titleRules() {
				return []
			},
			descriptionRules() {
				return []
			},
			typeRules() {
				return []
			},
			githubUrlRules() {
				return []
			},
		},		watch: {
			modelValue(newVal) {
				if (newVal) {
					this.initializeForm()
					// Show validation errors immediately when dialog opens
					this.$nextTick(() => {
						this.validateAllFields()
					})
				}
			},
			project: {
				handler() {
					if (this.modelValue) {
						this.initializeForm()
					}
				},
				immediate: true,
			},			// Watch form fields for real-time validation
			'form.title'() {
				if (this.modelValue) this.validateTitle()
			},
			'form.description'() {
				if (this.modelValue) this.validateDescription()
			},
			'form.content'() {
				if (this.modelValue) this.validateContent()
			},
			'form.type'() {
				if (this.modelValue) this.validateType()
			},
			'form.githubUrl'() {
				if (this.modelValue) this.validateGithubUrl()
			},
		},
		methods: {			initializeForm() {
				if (this.project) {
					this.form = { ...this.project }
				} else {
					this.resetForm()
				}
				this.errorMessage = ""
				this.contentError = ""
				this.validationErrors = []
				this.titleError = ""
				this.descriptionError = ""
				this.typeError = ""
				this.githubUrlError = ""
				
				// Validate immediately after initialization for new projects
				if (!this.project && this.modelValue) {
					this.$nextTick(() => {
						this.validateAllFields()
					})
				}
			},
			resetForm() {
				this.form = {
					title: "",
					description: "",
					content: "",
					coverImage: null,
					tags: [],
					githubUrl: "",
					type: "",
					_id: null,
				}
			},
			handleClose() {
				this.$emit("update:modelValue", false)
				this.$emit("close")
			},			handleSave() {
				// Clear previous errors
				this.errorMessage = ""
				this.contentError = ""
				this.validationErrors = []

				// Validate the form
				if (!this.validateAllFields()) {
					return
				}

				this.$emit("save", { ...this.form })
			},
			validateAllFields() {
				this.validateTitle()
				this.validateDescription()
				this.validateContent()
				this.validateType()
				this.validateGithubUrl()
				
				return !this.titleError && !this.descriptionError && !this.contentError && !this.typeError && !this.githubUrlError
			},
			validateTitle() {
				if (!this.modelValue) return
				
				if (!this.form.title || this.form.title.trim().length === 0) {
					this.titleError = this.$t('validationRequired')
				} else if (this.form.title.length < 3) {
					this.titleError = this.$t('validationTitleMinLength')
				} else if (this.form.title.length > 100) {
					this.titleError = this.$t('validationTitleMaxLength')
				} else {
					this.titleError = ""
				}
			},
			validateDescription() {
				if (!this.modelValue) return
				
				if (!this.form.description || this.form.description.trim().length === 0) {
					this.descriptionError = this.$t('validationRequired')
				} else if (this.form.description.length < 10) {
					this.descriptionError = this.$t('validationDescriptionMinLength')
				} else if (this.form.description.length > 500) {
					this.descriptionError = this.$t('validationDescriptionMaxLength')
				} else {
					this.descriptionError = ""
				}
			},
			validateContent() {
				if (!this.modelValue) return
				
				if (!this.form.content || this.form.content.trim().length === 0) {
					this.contentError = this.$t('validationRequired')
				} else {
					this.contentError = ""
				}
			},
			validateType() {
				if (!this.modelValue) return
				
				if (!this.form.type) {
					this.typeError = this.$t('validationRequired')
				} else {
					this.typeError = ""
				}
			},
			validateGithubUrl() {
				if (!this.modelValue) return
				
				if (this.form.githubUrl && !this.isValidUrl(this.form.githubUrl)) {
					this.githubUrlError = this.$t('validationUrlInvalid')
				} else {
					this.githubUrlError = ""
				}			},
			isValidUrl(string) {
				try {
					new URL(string)
					return true
				} catch (_) {
					return false
				}
			},
			async importGithubRepo(repo) {
				try {
					const readmeUrl = `https://api.github.com/repos/${repo.full_name}/readme`
					const readmeRes = await fetch(readmeUrl, {
						headers: { Accept: "application/vnd.github.v3.raw" },
					})
					const readmeMd = await readmeRes.text()

					// Convert Markdown to HTML immediately for backend compatibility
					this.form.title = repo.name
					this.form.description = repo.description || ""
					this.form.content = marked.parse(readmeMd)
					this.form.githubUrl = repo.html_url
					this.showGithubRepoDialog = false
				} catch (error) {
					console.error("Error importing GitHub repo:", error)
					this.errorMessage = "Failed to import repository. Please try again."
				}
			},
		},
	}
</script>
