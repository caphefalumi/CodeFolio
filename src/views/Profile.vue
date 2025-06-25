<template>
  <v-container class="profile-container py-8">
    <v-row class="profile-header" align="center" justify="center">
      <v-col cols="12" md="4" class="d-flex flex-column align-center">
        <v-avatar size="120" class="profile-avatar elevation-4 mb-4">
          <v-img :src="userProfile.avatar" cover></v-img>
        </v-avatar>
        <h2 class="text-h4 font-weight-bold mb-1">{{ userProfile.firstName + ' ' + userProfile.lastName }}</h2>
        <div class="text-subtitle-2 text-grey-darken-1 mb-2">@{{ userProfile.username }}</div>
        <div class="text-body-1 mb-2">{{ userProfile.bio }}</div>
        <div class="mb-2">
          <v-icon size="18" class="mr-1">mdi-email</v-icon>{{ userProfile.email }}
        </div>
        <div v-if="userProfile.githubUrl" class="mb-2">
          <v-icon size="18" class="mr-1">mdi-github</v-icon>
          <a :href="userProfile.githubUrl" target="_blank">GitHub</a>
        </div>
        <div class="d-flex gap-2 mb-2">
          <v-chip color="primary" class="mr-2" label>
            <v-icon left size="18">mdi-account-multiple</v-icon>
            {{ userProfile.followers?.length || 0 }} Followers
          </v-chip>
          <v-chip color="secondary" label>
            <v-icon left size="18">mdi-account-plus</v-icon>
            {{ userProfile.followed?.length || 0 }} Following
          </v-chip>
        </div>
        <div class="d-flex gap-2 mt-2">
          <v-btn v-if="isOwner" color="primary" variant="outlined" @click="showEditProfile = true">Edit Profile</v-btn>
          <v-btn v-if="isOwner" color="warning" variant="outlined" @click="showResetPassword = true">Reset Password</v-btn>
        </div>
      </v-col>
      <v-col cols="12" md="8">
        <v-card class="elevation-2 pa-6 profile-projects-card">
          <v-toolbar color="primary" dark flat class="rounded-lg mb-4">
            <v-toolbar-title class="text-h5">My Projects</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn v-if="isOwner" color="white" variant="text" @click="showNewProject = true">
              <v-icon left>mdi-plus</v-icon> Add New Project
            </v-btn>
          </v-toolbar>
          <v-row v-auto-animate>
            <v-col v-for="project in userProjects" :key="project._id" cols="12" md="6">
              <v-card class="project-card elevation-1 mb-4">
                <v-img :src="project.coverImage" height="180" cover class="rounded-t-lg"></v-img>
                <v-card-title class="font-weight-bold">{{ project.title }}</v-card-title>
                <v-card-text>
                  <div class="text-body-2 mb-2">{{ project.description }}</div>
                  <div class="mb-2">
                    <v-chip v-for="tag in project.tags" :key="tag" class="mr-2 mb-2" size="small">{{ tag }}</v-chip>
                  </div>
                </v-card-text>
                <v-card-actions>
                  <v-btn color="primary" variant="text" :to="`/${userProfile.username}/${project.id}`">
                    <v-icon left>mdi-eye</v-icon> View
                  </v-btn>
                  <v-btn v-if="isOwner" color="primary" variant="text" @click="editProject(project)">
                    <v-icon left>mdi-pencil</v-icon> Edit
                  </v-btn>
                  <v-btn v-if="isOwner" color="error" variant="text" @click="deleteProject(project)">
                    <v-icon left>mdi-delete</v-icon> Delete
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Edit Profile Dialog -->
    <v-dialog v-model="showEditProfile" fullscreen scrollable transition="dialog-bottom-transition">
      <v-card class="pa-0" style="max-width:100vw;">
        <v-toolbar color="primary" dark flat>
          <v-toolbar-title>Edit Profile</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="showEditProfile = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-toolbar>
        <v-container class="py-6 px-2 px-md-12" style="max-width:600px; margin:auto;">
          <div class="d-flex flex-column align-center mb-4">
            <v-avatar size="96" class="mb-2">
              <v-img :src="editForm.avatarPreview || userProfile.avatar" cover></v-img>
            </v-avatar>
            <v-btn small color="primary" variant="text" @click="$refs.avatarInput.click()">
              <v-icon left>mdi-camera</v-icon> Change Photo
            </v-btn>
            <input ref="avatarInput" type="file" accept="image/*" style="display:none" @change="onAvatarChange" />
          </div>
          <v-form @submit.prevent="handleProfileUpdate" class="w-100">
            <v-text-field v-model="editForm.firstName" label="First Name" required></v-text-field>
            <v-text-field v-model="editForm.lastName" label="Last Name" required></v-text-field>
            <v-text-field v-model="editForm.email" label="Email" required disabled></v-text-field>
            <v-textarea v-model="editForm.bio" label="Bio" rows="3"></v-textarea>
            <v-alert v-if="errorMessage" type="error" class="mt-2">{{ errorMessage }}</v-alert>
            <v-alert v-if="successMessage" type="success" class="mt-2">{{ successMessage }}</v-alert>
            <v-btn color="primary" class="mt-4" type="submit" block :loading="loading">Save Changes</v-btn>
          </v-form>
        </v-container>
      </v-card>
    </v-dialog>

    <!-- New Project Dialog -->
    <v-dialog v-model="showNewProject" max-width="800">
      <v-card>
        <v-toolbar color="primary" dark flat>
          <v-toolbar-title>Add New Project</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-form @submit.prevent="saveProject">
            <v-text-field v-model="projectForm.title" label="Project Title" required></v-text-field>
            <v-textarea v-model="projectForm.description" label="Project Description" required></v-textarea>
            <v-textarea v-model="projectForm.content" label="Project Content" required></v-textarea>
            <v-file-input v-model="projectForm.coverImage" label="Project Cover Image" accept="image/*" prepend-icon="mdi-image"></v-file-input>
            <v-combobox v-model="projectForm.tags" label="Tags" multiple chips small-chips></v-combobox>
            <v-text-field v-model="projectForm.githubUrl" label="GitHub Repository URL" prepend-icon="mdi-github"></v-text-field>
            <v-select v-model="projectForm.type" :items="projectTypes" label="Project Type" required></v-select>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="saveProject" :loading="loading">Save Project</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Password Reset Dialog (FAANG style) -->
    <v-dialog v-model="showResetPassword" max-width="420">
      <v-card>
        <v-toolbar color="warning" dark flat>
          <v-toolbar-title>Reset Password</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-stepper v-model="resetStep" flat class="mb-2">
            <v-stepper-header>
              <v-stepper-step :complete="resetStep > 1" step="1">Email</v-stepper-step>
              <v-divider></v-divider>
              <v-stepper-step :complete="resetStep > 2" step="2">Code</v-stepper-step>
              <v-divider></v-divider>
              <v-stepper-step step="3">New Password</v-stepper-step>
            </v-stepper-header>
          </v-stepper>
          <v-form v-if="resetStep === 1" @submit.prevent="handleForgotPassword">
            <v-text-field v-model="resetEmail" label="Email" type="email" required></v-text-field>
            <v-btn color="primary" type="submit" :loading="resetLoading" block>Send Reset Code</v-btn>
          </v-form>
          <v-form v-if="resetStep === 2" @submit.prevent="handleVerifyCode">
            <v-text-field v-model="resetCode" label="6-digit Code" required></v-text-field>
            <v-btn color="primary" type="submit" :loading="resetLoading" block>Verify Code</v-btn>
          </v-form>
          <v-form v-if="resetStep === 3" @submit.prevent="handleResetPassword">
            <v-text-field v-model="resetNewPassword" label="New Password" type="password" required></v-text-field>
            <v-text-field v-model="resetConfirmPassword" label="Retype New Password" type="password" required></v-text-field>
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
</template>

<style scoped>
.profile-container {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}
.profile-header {
  margin-bottom: 32px;
}
.profile-avatar {
  border: 4px solid #fff;
  box-shadow: 0 4px 24px rgba(44, 62, 80, 0.15);
}
.profile-projects-card {
  border-radius: 18px;
  background: #fff;
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
      ],
      showResetPassword: false,
      resetEmail: '',
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
        this.editForm.email = profile.email || ''

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
          type: this.projectForm.type, // Add type to payload
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
        image: null,
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
        const res = await axios.post('/api/auth/forgot-password', { email: this.resetEmail });
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
        const res = await axios.post('/api/auth/verify-reset-code', { email: this.resetEmail, code: this.resetCode });
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
        const res = await axios.post('/api/auth/reset-password', { email: this.resetEmail, code: this.resetCode, newPassword: this.resetNewPassword });
        this.resetMessage = res.data.message;
        this.resetStep = 1;
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
