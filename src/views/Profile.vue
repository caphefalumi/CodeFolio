<template>
  <v-theme-provider>
    <v-container class="py-8">
      <section aria-labelledby="profile-heading">
        <v-row class="profile-header" align="center" justify="center">
          <v-col cols="12" md="4" class="d-flex flex-column align-center">
            <v-avatar size="120" class="profile-avatar elevation-4 mb-4">
              <v-img :src="userProfile.avatar" :alt="`${userProfile.firstName} ${userProfile.lastName} profile picture`" cover></v-img>
            </v-avatar>
            <h1 id="profile-heading" class="text-h4 font-weight-bold mb-1">{{ userProfile.firstName + ' ' + userProfile.lastName }}</h1>
            <div class="text-subtitle-2 text-grey-darken-1 mb-2">@{{ userProfile.username }}</div>
            <div class="text-body-1 mb-2">{{ userProfile.bio }}</div>
            <div class="mb-2">
              <v-icon size="18" class="mr-1" aria-hidden="true">mdi-email</v-icon>
              <span>{{ userProfile.email }}</span>
            </div>
            <div v-if="userProfile.githubUrl" class="mb-2">
              <v-icon size="18" class="mr-1" aria-hidden="true">mdi-github</v-icon>
              <a :href="userProfile.githubUrl" target="_blank" rel="noopener noreferrer" aria-label="GitHub profile (opens in new tab)">GitHub</a>
            </div>
            <div class="d-flex gap-2 mb-2">
              <v-chip color="primary" class="mr-2" label>
                <v-icon left size="18" aria-hidden="true">mdi-account-multiple</v-icon>
                <span>{{ userProfile.followers?.length || 0 }} Followers</span>
              </v-chip>
              <v-chip color="secondary" label>
                <v-icon left size="18" aria-hidden="true">mdi-account-plus</v-icon>
                <span>{{ userProfile.followed?.length || 0 }} Following</span>
              </v-chip>
            </div>
            <div class="d-flex gap-2 mt-2">
              <v-btn v-if="isOwner" color="primary" variant="outlined" @click="showEditProfile = true">Edit Profile</v-btn>
              <v-btn v-if="isOwner" color="warning" variant="outlined" @click="showResetPassword = true">Reset Password</v-btn>
            </div>
          </v-col>

          <v-col cols="12" md="8">
            <section aria-labelledby="projects-section-heading">
              <v-card class="elevation-2 pa-6 profile-projects-card">
                <v-toolbar color="primary" dark flat class="rounded-lg mb-4">
                  <v-toolbar-title id="projects-section-heading" class="text-h5">My Projects</v-toolbar-title>
                  <v-spacer></v-spacer>
                  <v-btn v-if="isOwner" color="white" variant="text" @click="showNewProject = true" aria-label="Add a new project">
                    <v-icon left aria-hidden="true">mdi-plus</v-icon> Add New Project
                  </v-btn>
                </v-toolbar>
                <v-row v-auto-animate>
                  <v-col v-for="project in userProjects" :key="project._id" cols="12" md="6">
                    <article>
                      <v-card class="project-card elevation-1 mb-4">
                        <v-img :src="project.coverImage" height="180" cover class="rounded-t-lg" :alt="`${project.title} project cover image`"></v-img>
                        <v-card-title class="font-weight-bold">{{ project.title }}</v-card-title>
                        <v-card-text>
                          <div class="text-body-2 mb-2">{{ project.description }}</div>
                          <div class="mb-2" role="list" aria-label="Project tags">
                            <v-chip v-for="tag in project.tags" :key="tag" class="mr-2 mb-2" size="small" role="listitem">{{ tag }}</v-chip>
                          </div>
                        </v-card-text>
                        <v-card-actions>
                          <v-btn color="primary" variant="text" :to="`/${userProfile.username}/${project.id}`" :aria-label="`View project: ${project.title}`">
                            <v-icon left aria-hidden="true">mdi-eye</v-icon> View
                          </v-btn>
                          <v-btn v-if="isOwner" color="primary" variant="text" @click="editProject(project)" :aria-label="`Edit project: ${project.title}`">
                            <v-icon left aria-hidden="true">mdi-pencil</v-icon> Edit
                          </v-btn>
                          <v-btn v-if="isOwner" color="error" variant="text" @click="deleteProject(project)" :aria-label="`Delete project: ${project.title}`">
                            <v-icon left aria-hidden="true">mdi-delete</v-icon> Delete
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </article>
                  </v-col>
                </v-row>
              </v-card>
            </section>
          </v-col>
        </v-row>
      </section>

      <!-- Edit Profile Dialog -->
      <v-dialog v-model="showEditProfile" fullscreen scrollable transition="dialog-bottom-transition">
        <v-card class="pa-0" style="max-width:100vw;">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title id="edit-profile-heading">Edit Profile</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon @click="showEditProfile = false" aria-label="Close edit profile dialog">
              <v-icon aria-hidden="true">mdi-close</v-icon>
            </v-btn>
          </v-toolbar>
          <v-container class="py-6 px-2 px-md-12" style="max-width:600px; margin:auto;">
            <div class="d-flex flex-column align-center mb-4">
              <v-avatar size="96" class="mb-2">
                <v-img :src="userProfile.avatar" :alt="`Current profile picture`" cover></v-img>
              </v-avatar>
              <v-btn small color="primary" variant="text" @click="$refs.avatarInput.click()" aria-label="Change profile photo. Click to upload a new profile picture">
                <v-icon left aria-hidden="true">mdi-camera</v-icon> Change Photo
              </v-btn>
              <input ref="avatarInput" type="file" accept="image/*" style="display:none" @change="onAvatarChange" aria-label="Choose profile picture file" />
            </div>
            <v-form @submit.prevent="handleProfileUpdate" class="w-100" aria-labelledby="edit-profile-heading">
              <v-text-field v-model="editForm.firstName" label="First Name" required autocomplete="given-name"></v-text-field>
              <v-text-field v-model="editForm.lastName" label="Last Name" required autocomplete="family-name"></v-text-field>
              <v-text-field v-model="editForm.email" label="Email" required disabled autocomplete="email" aria-label="Email address (cannot be changed for security reasons)"></v-text-field>
              <v-textarea v-model="editForm.bio" label="Bio" rows="3" aria-label="Bio - Write a brief description about yourself"></v-textarea>
              <v-alert v-if="errorMessage" type="error" class="mt-2" role="alert">{{ errorMessage }}</v-alert>
              <v-alert v-if="successMessage" type="success" class="mt-2" role="alert">{{ successMessage }}</v-alert>
              <v-btn color="primary" class="mt-4" type="submit" block :loading="loading" :aria-label="loading ? 'Saving changes...' : 'Save profile changes'">Save Changes</v-btn>
            </v-form>
          </v-container>
        </v-card>
      </v-dialog>

      <!-- New Project Dialog -->
      <v-dialog v-model="showNewProject" max-width="800">
        <v-card>
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title id="new-project-heading">Add New Project</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="saveProject" aria-labelledby="new-project-heading">
              <v-text-field v-model="projectForm.title" label="Project Title" required aria-label="Enter a descriptive title for your project"></v-text-field>
              <v-textarea v-model="projectForm.description" label="Project Description" required aria-label="Provide a brief description of what your project does"></v-textarea>
              <v-textarea v-model="projectForm.content" label="Project Content" required aria-label="Write detailed content about your project, including features and implementation details"></v-textarea>
              <v-file-input v-model="projectForm.coverImage" label="Project Cover Image" accept="image/*" prepend-icon="mdi-image" aria-label="Upload a cover image that represents your project"></v-file-input>
              <v-combobox v-model="projectForm.tags" label="Tags" multiple chips small-chips aria-label="Add tags to help categorize your project. You can create new tags by typing and pressing enter."></v-combobox>
              <v-text-field v-model="projectForm.githubUrl" label="GitHub Repository URL" prepend-icon="mdi-github" type="url" aria-label="Enter the URL of your GitHub repository for this project"></v-text-field>
              <v-select v-model="projectForm.type" :items="projectTypes" label="Project Type" required aria-label="Select the type of project you are adding"></v-select>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="saveProject" :loading="loading" :aria-label="loading ? 'Saving project...' : 'Save project'">Save Project</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Password Reset Dialog -->
      <v-dialog v-model="showResetPassword" max-width="420">
        <v-card>
          <v-toolbar color="warning" dark flat>
            <v-toolbar-title>Reset Password</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-stepper v-model="resetStep" flat class="mb-2">
              <v-stepper-header>
                <v-stepper-step :complete="resetStep > 1" step="1">Send Code</v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step :complete="resetStep > 2" step="2">Verify Code</v-stepper-step>
                <v-divider></v-divider>
                <v-stepper-step step="3">New Password</v-stepper-step>
              </v-stepper-header>
            </v-stepper>

            <v-form v-if="resetStep === 1" @submit.prevent="handleForgotPassword">
              <p class="text-body-2 mb-4">A reset code will be sent to: <strong>{{ userProfile.email }}</strong></p>
              <v-btn color="primary" type="submit" :loading="resetLoading" block>Send Reset Code</v-btn>
            </v-form>

            <v-form v-if="resetStep === 2" @submit.prevent="handleVerifyCode">
              <v-text-field v-model="resetCode" label="6-digit Code" required aria-label="Enter the 6-digit verification code sent to your email" autocomplete="one-time-code"></v-text-field>
              <v-btn color="primary" type="submit" :loading="resetLoading" block>Verify Code</v-btn>
            </v-form>

            <v-form v-if="resetStep === 3" @submit.prevent="handleResetPassword">
              <v-text-field v-model="resetNewPassword" label="New Password" type="password" required aria-label="Enter your new password" autocomplete="new-password"></v-text-field>
              <v-text-field v-model="resetConfirmPassword" label="Retype New Password" type="password" required aria-label="Confirm your new password by typing it again" autocomplete="new-password"></v-text-field>
              <v-btn color="primary" type="submit" :loading="resetLoading" block>Set New Password</v-btn>
            </v-form>

            <v-alert v-if="resetMessage" type="success" class="mt-2">{{ resetMessage }}</v-alert>
            <v-alert v-if="resetError" type="error" class="mt-2">{{ resetError }}</v-alert>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="showResetPassword = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-alert v-if="errorMessage" type="error" class="mb-4" border="start" colored-border elevation="0" density="comfortable" style="background-color: #fff; color: #d32f2f; font-weight: 500;">
        <template #prepend>
          <v-icon color="error" size="24">mdi-alert-circle</v-icon>
        </template>
        {{ errorMessage }}
      </v-alert>
    </v-container>
  </v-theme-provider>
</template>


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
<script>
import {
  fetchProfile,
  fetchProjects,
  fetchCurrentUser,
  getAccessToken
} from '@/composables/user.js'
import axios from 'axios'
export default {
  name: 'ProfileView',
  data() {
    return {
      userProfile: {},
      userProjects: [],
      showEditProfile: false,
      showNewProject: false,
      loading: false,
      isOwner: false,
      editForm: {
        firstName: '',
        lastName: '',
        bio: '',
        avatar: null,
        avatarPreview: null
      },
      successMessage: '',
      projectForm: {
        title: '',
        description: '',
        content: '',
        coverImage: null,
        tags: [],
        githubUrl: '',
        type: '',
      },
      errorMessage: '',
      projectTypes: [
        'Web Development',
        'Mobile App',
        'API Development',
        'Other',
      ],      showResetPassword: false,
      resetCode: '',
      resetNewPassword: '',
      resetConfirmPassword: '',
      resetStep: 1,
      resetLoading: false,
      resetMessage: '',
      resetError: '',
    }
  },
  computed: {
    accessToken() {
      return getAccessToken()
    }
  },
  methods: {
    async fetchProfileAndProjects(username) {
      try {
        // 1. Get public user profile by username
        const profile = await fetchProfile(username)
        this.userProfile = profile

        // 2. Try to get current logged-in user (optional)
        try {
          this.currentUser = await fetchCurrentUser()
          this.isOwner = this.currentUser?._id === profile._id
        } catch (err) {
          console.warn('Not logged in or failed to fetch current user:', err)
          this.currentUser = null
          this.isOwner = false
        }

        // 3. Fill edit form fields
        this.editForm.firstName = profile.firstName || ''
        this.editForm.lastName = profile.lastName || ''
        this.editForm.bio = profile.bio
        this.editForm.avatar = null
        this.editForm.avatarPreview = profile.avatar
        this.editForm.email = profile.email

        // 4. Fetch user's projects
        this.userProjects = await fetchProjects(username)
      } catch (err) {
        console.error('Error loading profile or projects:', err)
      }
    },

    onAvatarChange(e) {
      const file = e.target.files[0]
      if (file) {
        this.editForm.avatar = file
        this.editForm.avatarPreview = URL.createObjectURL(file)
      }
    },

    async handleProfileUpdate() {
      this.errorMessage = '';
      this.successMessage = '';
      this.loading = true;
      try {
        let avatarUri = this.editForm.avatar
        if (avatarUri && typeof avatarUri === 'object') {
          const formData = new FormData()
          formData.append('image', avatarUri)
          const uploadRes = await axios.post('/api/upload/image/profile', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${this.accessToken}`
            }
          })
          avatarUri = uploadRes.data.uri
        } else {
          avatarUri = this.userProfile.avatar
        }
        const payload = {
          firstName: this.editForm.firstName,
          lastName: this.editForm.lastName,
          bio: this.editForm.bio,
          avatar: avatarUri
        }
        await axios.patch('/api/users', payload, {
          headers: { Authorization: `Bearer ${this.accessToken}` }
        })
        this.successMessage = 'Profile updated successfully!';
        this.fetchProfileAndProjects(this.$route.params.username)
        setTimeout(() => {
          this.showEditProfile = false
          this.successMessage = ''
        }, 1200)
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Failed to update profile. Please try again.';
      } finally {
        this.loading = false;
      }
    },

    async saveProject() {
      this.loading = true
      try {
        let imageUri = this.projectForm.coverImage

        if (imageUri && typeof imageUri === 'object') {
          const formData = new FormData()
          formData.append('image', imageUri)

          const uploadRes = await axios.post('/api/upload/image/blog', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${this.accessToken}`
            }
          })

          imageUri = uploadRes.data.uri
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

        let response
        if (this.projectForm._id) {
          response = await axios.patch(`/api/posts/${this.projectForm._id}`, payload, {
            headers: { Authorization: `Bearer ${this.accessToken}` }
          })
          const updated = response.data.post
          const index = this.userProjects.findIndex(p => p._id === updated._id)
          if (index !== -1) {
            this.userProjects.splice(index, 1, updated)
          }
        } else {
          response = await axios.post('/api/posts', payload, {
            headers: { Authorization: `Bearer ${this.accessToken}` }
          })
          this.userProjects.push(response.data.post)
        }

        this.showNewProject = false
        this.resetProjectForm()
      } catch (error) {
        console.error('Project save failed:', error)
      } finally {
        this.loading = false
      }
    },

    editProject(project) {
      this.projectForm = { ...project }
      this.showNewProject = true
    },

    async deleteProject(project) {
      if (confirm('Are you sure you want to delete this project?')) {
        this.loading = true
        try {
          await axios.delete(`/api/posts/${project._id}`, {
            headers: { Authorization: `Bearer ${this.accessToken}` }
          })
          this.userProjects = this.userProjects.filter(p => p._id !== project._id)
        } catch (error) {
          console.error('Project deletion failed:', error)
        } finally {
          this.loading = false
        }
      }
    },    
    resetProjectForm() {
      this.projectForm = {
        title: '',
        description: '',
        content: '',
        coverImage: null,
        tags: [],
        githubUrl: '',
        type: '', // Reset type
      }
    },
    async handleForgotPassword() {
      this.resetLoading = true;
      this.resetError = '';
      this.resetMessage = '';
      try {
        // Use the current user's email automatically
        const token = sessionStorage.getItem('accessToken');
        const res = await axios.post('/api/auth/forgot-password', {}, {headers: { Authorization: `Bearer ${token}` } });
        this.resetMessage = res.data.message;
        this.resetStep = 2;
      } catch (err) {
        this.resetError = err.response?.data?.message || err.message;
      } finally {
        this.resetLoading = false;
      }
    },
    async handleVerifyCode() {
      this.resetLoading = true;
      this.resetError = '';
      this.resetMessage = '';
      try {
        const token = sessionStorage.getItem('accessToken');
        const res = await axios.post('/api/auth/verify-reset-code', { code: this.resetCode }, { headers: { Authorization: `Bearer ${token}` } });
        this.resetMessage = res.data.message;
        this.resetStep = 3;
      } catch (err) {
        this.resetError = err.response?.data?.message || err.message;
      } finally {
        this.resetLoading = false;
      }
    },
    async handleResetPassword() {
      this.resetLoading = true;
      this.resetError = '';
      this.resetMessage = '';
      if (this.resetNewPassword !== this.resetConfirmPassword) {
        this.resetError = 'Passwords do not match';
        this.resetLoading = false;
        return;
      }
      try {
        const token = sessionStorage.getItem('accessToken');
        const res = await axios.post('/api/auth/reset-password', { code: this.resetCode, newPassword: this.resetNewPassword } , { headers: { Authorization: `Bearer ${token}` } });
        this.resetMessage = res.data.message;
        this.resetStep = 1;
        // Close the dialog after successful password reset
        setTimeout(() => {
          this.showResetPassword = false;
          this.resetMessage = '';
          this.resetCode = '';
          this.resetNewPassword = '';
          this.resetConfirmPassword = '';
        }, 2000);
      } catch (err) {
        this.resetError = err.response?.data?.message || err.message;
      } finally {
        this.resetLoading = false;
      }
    },
  },
  mounted() {
    const username = this.$route.params.username
    this.fetchProfileAndProjects(username)
  }
}
</script>
