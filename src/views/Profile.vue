<template>
  <div>
    <v-container>
      <!-- Profile Header -->
      <v-row class="mb-6">
        <v-col cols="12" md="4">
          <v-card>
            <v-img
              :src="userProfile.avatar || 'https://via.placeholder.com/300'"
              height="300"
              cover
            ></v-img>
            <v-card-text>
              <h2 class="text-h4 mb-2">{{ userProfile.name }}</h2>
              <p class="text-subtitle-1 mb-2">{{ userProfile.email }}</p>
              <p class="text-body-1">{{ userProfile.bio }}</p>
            </v-card-text>
            <v-card-actions>
              <v-btn
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
        <v-col cols="12" md="8">
          <v-card>
            <v-toolbar color="primary" dark flat>
              <v-toolbar-title>My Projects</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn
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
                  :key="project.id"
                  cols="12"
                  md="6"
                >
                  <v-card>
                    <v-img
                      :src="project.image"
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
                        :to="'/project/' + project.id"
                      >
                        View
                      </v-btn>
                      <v-btn
                        color="primary"
                        variant="text"
                        @click="editProject(project)"
                      >
                        Edit
                      </v-btn>
                      <v-spacer></v-spacer>
                      <v-btn
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
export default {
  name: 'ProfileView',
  data() {
    return {
      userProfile: {
        name: 'John Doe',
        email: 'john@example.com',
        bio: 'Full-stack developer passionate about creating amazing web applications.',
        avatar: null
      },
      userProjects: [
        {
          id: 1,
          title: 'Sample Project 1',
          description: 'A brief description of the project',
          image: 'https://via.placeholder.com/400x200',
          tags: ['Vue.js', 'Vuetify'],
          githubUrl: 'https://github.com/username/project1'
        }
      ],
      showEditProfile: false,
      showNewProject: false,
      loading: false,
      editForm: {
        name: '',
        bio: '',
        avatar: null
      },
      projectForm: {
        title: '',
        description: '',
        image: null,
        tags: [],
        githubUrl: ''
      }
    }
  },
  methods: {
    async saveProfile() {
      this.loading = true
      try {
        // Add your profile update logic here
        await new Promise(resolve => setTimeout(resolve, 1000))
        this.userProfile = {
          ...this.userProfile,
          ...this.editForm
        }
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
        // Add your project save logic here
        await new Promise(resolve => setTimeout(resolve, 1000))
        const newProject = {
          id: this.userProjects.length + 1,
          ...this.projectForm
        }
        this.userProjects.push(newProject)
        this.showNewProject = false
        this.projectForm = {
          title: '',
          description: '',
          image: null,
          tags: [],
          githubUrl: ''
        }
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
          // Add your project deletion logic here
          await new Promise(resolve => setTimeout(resolve, 1000))
          this.userProjects = this.userProjects.filter(p => p.id !== project.id)
        } catch (error) {
          console.error('Project deletion failed:', error)
        } finally {
          this.loading = false
        }
      }
    }
  }
}
</script> 