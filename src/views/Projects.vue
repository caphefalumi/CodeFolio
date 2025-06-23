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
            item-title="title"
            item-value="value"
            label="Project Type"
            variant="outlined"
            hide-details
          ></v-select>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="sortBy"
            :items="sortOptions"
            item-title="title"
            item-value="value"
            label="Sort By"
            variant="outlined"
            hide-details
          ></v-select>
        </v-col>
      </v-row>

      <!-- Projects Grid -->
      <v-row>
        <v-col
          v-for="project in filteredProjects"
          :key="project._id"
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
                :to="`${project.getFullPath}`"
                prepend-icon="mdi-eye"
              >
                View Project
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn icon @click="toggleLike(project)">
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
    filteredProjects() {
      if (this.projects) {

        return this.projects
          .filter(project => {
            const searchMatch =
              this.search === '' ||
              project.title.toLowerCase().includes(this.search.toLowerCase()) ||
              project.description?.toLowerCase().includes(this.search.toLowerCase())
            return searchMatch
        })
        // .sort((a, b) => {
        //   if (this.sortBy === 'newest') {
        //     return new Date(b.createdAt) - new Date(a.createdAt)
        //   } else if (this.sortBy === 'liked') {
        //     return (b.upvotes || 0) - (a.upvotes || 0)
        //   } else if (this.sortBy === 'viewed') {
        //     return (b.views || 0) - (a.views || 0)
        //   }
        //   return 0
        // })
      }

    },
    totalPages() {
      return Math.ceil(this.filteredProjects.length / this.itemsPerPage)
    },
    paginatedProjects() {
      const start = (this.page - 1) * this.itemsPerPage
      return this.filteredProjects.slice(start, start + this.itemsPerPage)
    }
  },
  methods: {
    toggleLike(project) {
      project.liked = !project.liked
      // Optional: Add axios call to backend to update like state
    }
  },
  async mounted() {
    try {
      const response = await axios.get('/api/posts/')
      this.projects = response.data
      console.log('Projects:', this.projects)
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  },
}
</script>
