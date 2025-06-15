<template>
  <div>
    <v-container>
      <!-- Hero Section -->
      <v-row class="mt-16 mb-8">
        <v-col cols="12" md="6">
          <h1 class="text-h2 font-weight-bold mb-4">Showcase Your Projects</h1>
          <p class="text-h6 mb-6">
            A platform for independent developers and creators to showcase their work.
            Share your projects, get feedback, and connect with other creators.
          </p>
          <v-btn color="primary" size="large" to="/projects" class="mr-4">
            Browse Projects
          </v-btn>
          <v-btn variant="outlined" size="large" to="/login">
            Get Started
          </v-btn>
        </v-col>
        <v-col cols="12" md="6" class="d-flex align-center justify-center">
          <v-img
            src="https://via.placeholder.com/500x300"
            max-width="500"
            class="rounded-lg"
          ></v-img>
        </v-col>
      </v-row>

      <!-- Featured Projects Section -->
      <v-row class="mt-8">
        <v-col cols="12">
          <h2 class="text-h4 mb-6">Featured Projects</h2>
        </v-col>
        <v-col
          v-for="(project, index) in featuredProjects"
          :key="project._id || index"
          cols="12"
          md="4"
        >
          <v-card>
            <v-img
              :src="project.image || 'https://via.placeholder.com/400x200'"
              height="200"
              cover
            ></v-img>
            <v-card-title>{{ project.title }}</v-card-title>
            <v-card-text>
              <p>{{ project.description || 'No description provided.' }}</p>
            </v-card-text>
            <v-card-actions>
              <v-btn
                color="primary"
                variant="text"
                :to="`/project/${project._id}`"
              >
                View Project
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>


<script>
import axios from 'axios'

export default {
  name: 'HomeView',
  data() {
    return {
      featuredProjects: []
    }
  },
  mounted() {
    axios.get('/api/posts/')
      .then(response => {
        this.featuredProjects = response.data
        console.log("Projects:", this.featuredProjects)
      })
      .catch(error => {
        console.error('Error fetching featured projects:', error)
      })
  },
}
</script>

<style>
#app {
  font-family: 'Roboto', sans-serif;
}
</style> 