<template>
  <div>
    <v-container>
      <!-- Profile Header -->
      <v-row class="mb-6">
        <v-col cols="12" md="4">
          <v-card>
            <v-img
              :src="userProfile.avatar"
              height="300"
              cover
            ></v-img>
            <v-card-text>
              <h2 class="text-h4 mb-2">{{ userProfile.firstName + ' ' + userProfile.lastName }}</h2>
              <p class="text-subtitle-1 mb-2">{{ userProfile.email }}</p>
              <p class="text-body-1">{{ userProfile.bio }}</p>
            </v-card-text>
            <v-card-actions>
              <v-btn v-if="isOwner"
                color="primary"
                variant="outlined"
                @click="showEditProfile = true"
              >
                Edit Profile
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <!-- Projects Section -->
        <v-col cols="12" md="20">
          <v-card>
            <v-toolbar color="primary" dark flat>
              <v-toolbar-title>My Projects</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn v-if="isOwner"
                color="white"
                variant="text"
                @click="showNewProject = true"
              >
                Add New Project
              </v-btn>
            </v-toolbar>
            <v-card-text>
              <v-row>
                <v-col
                  v-for="project in userProjects"
                  :key="project._id"
                  cols="12"
                  md="6"
                >
                  <v-card>
                    <v-img
                      :src="project.coverImage"
                      height="200"
                      cover
                    ></v-img>
                    <v-card-title>{{ project.title }}</v-card-title>
                    <v-card-text>
                      <p>{{ project.description }}</p>
                      <v-chip
                        v-for="tag in project.tags"
                        :key="tag"
                        class="mr-2 mb-2"
                        size="small"
                      >
                        {{ tag }}
                      </v-chip>
                    </v-card-text>
                    <v-card-actions>
                      <v-btn
                        color="primary"
                        variant="text"
                        :to="`/${userProfile.username}/${project.id}`"
                      >
                        View
                      </v-btn>
                      <v-btn v-if="isOwner"
                        color="primary"
                        variant="text"
                        @click="editProject(project)"
                      >
                        Edit
                      </v-btn>
                      <v-spacer></v-spacer>
                      <v-btn v-if="isOwner"
                        color="error"
                        variant="text"
                        @click="deleteProject(project)"
                      >
                        Delete
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Edit Profile Dialog -->
    <v-dialog v-model="showEditProfile" max-width="500">
      <v-card>
        <v-toolbar color="primary" dark flat>
          <v-toolbar-title>Edit Profile</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-form @submit.prevent="saveProfile">
            <v-text-field
              v-model="editForm.name"
              label="Name"
              required
            ></v-text-field>
            <v-text-field
              v-model="editForm.bio"
              label="Bio"
              multiline
              rows="3"
            ></v-text-field>
            <v-file-input
              v-model="editForm.avatar"
              label="Profile Picture"
              accept="image/*"
              prepend-icon="mdi-camera"
            ></v-file-input>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="saveProfile"
            :loading="loading"
          >
            Save Changes
          </v-btn>
        </v-card-actions>
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
            <v-text-field
              v-model="projectForm.title"
              label="Project Title"
              required
            ></v-text-field>
            <v-textarea
              v-model="projectForm.description"
              label="Project Description"
              required
            ></v-textarea>
            <v-textarea
              v-model="projectForm.content"
              label="Project Content"
              required
            ></v-textarea>
            <v-file-input
              v-model="projectForm.image"
              label="Project Image"
              accept="image/*"
              prepend-icon="mdi-image"
            ></v-file-input>
            <v-combobox
              v-model="projectForm.tags"
              label="Tags"
              multiple
              chips
              small-chips
            ></v-combobox>
            <v-text-field
              v-model="projectForm.githubUrl"
              label="GitHub Repository URL"
              prepend-icon="mdi-github"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="saveProject"
            :loading="loading"
          >
            Save Project
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

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
      currentUserId: '',
      editForm: {
        name: '',
        bio: '',
        avatar: null
      },
      projectForm: {
        title: '',
        description: '',
        content: '',
        image: null,
        tags: [],
        githubUrl: ''
      }
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
        // 1. Get route profile
        const profile = await fetchProfile(username)
        this.userProfile = profile

        // 2. Get current logged-in user
        const currentUser = await fetchCurrentUser()
        this.currentUserId = currentUser._id

        // 3. Check ownership
        this.isOwner = profile._id === currentUser._id

        // 4. Fill edit form
        this.editForm.name = profile.name
        this.editForm.bio = profile.bio

        // 5. Get user projects
        this.userProjects = await fetchProjects(username)
        console.log('User Projects:', this.userProjects)
      } catch (err) {
        console.error('Error loading profile or projects:', err)
      }
    },

    async saveProfile() {
      this.loading = true
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
        }

        const payload = {
          name: this.editForm.name,
          bio: this.editForm.bio,
          avatar: avatarUri
        }

        await axios.patch('/api/users', payload, {
          headers: { Authorization: `Bearer ${this.accessToken}` }
        })

        this.fetchProfileAndProjects(this.$route.params.username)
        this.showEditProfile = false
      } catch (error) {
        console.error('Profile update failed:', error)
      } finally {
        this.loading = false
      }
    },

    async saveProject() {
      this.loading = true
      try {
        let imageUri = this.projectForm.image

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
          githubUrl: this.projectForm.githubUrl
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
        githubUrl: ''
      }
    }
  },
  mounted() {
    const username = this.$route.params.username
    this.fetchProfileAndProjects(username)
  }
}
</script>
