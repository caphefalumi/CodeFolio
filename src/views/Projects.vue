<template>
  <div>
    <v-container>
      <!-- Search and Filter Section -->
      <v-row class="mb-6">
        <v-col cols="12" md="6">
          <v-text-field
            v-model="search"
            label="Search projects"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            hide-details
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="selectedType"
            :items="projectTypes"
            label="Project Type"
            variant="outlined"
            hide-details
          ></v-select>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="sortBy"
            :items="sortOptions"
            label="Sort By"
            variant="outlined"
            hide-details
          ></v-select>
        </v-col>
      </v-row>

      <!-- Projects Grid -->
      <v-row>
        <v-col
          v-for="project in projects"
          :key="project.id"
          cols="12"
          md="4"
        >
          <v-card>
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
                View Project
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn
                icon
                @click="toggleLike(project)"
              >
                <v-icon>
                  {{ project.liked ? 'mdi-heart' : 'mdi-heart-outline' }}
                </v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- Pagination -->
      <v-row class="mt-6">
        <v-col cols="12" class="text-center">
          <v-pagination
            v-model="page"
            :length="totalPages"
            rounded
          ></v-pagination>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'ProjectsView',
  data() {
    return {
      projects: [],
      search: '',
      selectedType: 'all',
      sortBy: 'newest',
      page: 1,
      itemsPerPage: 9,
      projectTypes: [
        { title: 'All Types', value: 'all' },
        { title: 'Web App', value: 'web' },
        { title: 'Mobile App', value: 'mobile' },
        { title: 'Game', value: 'game' },
        { title: 'Design', value: 'design' }
      ],
      sortOptions: [
        { title: 'Newest First', value: 'newest' },
        { title: 'Most Liked', value: 'liked' },
        { title: 'Most Viewed', value: 'viewed' }
      ]
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.projects.length / this.itemsPerPage)
    }
  },
  methods: {
    toggleLike(project) {
      project.liked = !project.liked
      // Add API call here to update like status
    }
  },
  mounted() {
    axios.get('/api/posts/')
      .then(response => {
        this.projects = response.data
        console.log("Projects:", this.featuredProjects)
      })
      .catch(error => {
        console.error('Error fetching featured projects:', error)
      })
  },
}
</script>