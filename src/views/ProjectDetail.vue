<template>
  <div>
    <v-container>
      <v-row>
        <!-- Project Header -->
        <v-col cols="12">
          <v-card>
            <v-img
              :src="project.image"
              height="400"
              cover
            ></v-img>
            <v-card-title class="text-h3">
              {{ project.title }}
            </v-card-title>
            <v-card-subtitle>
              By {{ project.author }}
            </v-card-subtitle>
            <v-card-text>
              <p class="text-body-1 mb-4">{{ project.description }}</p>
              <v-chip
                v-for="tag in project.tags"
                :key="tag"
                class="mr-2 mb-2"
              >
                {{ tag }}
              </v-chip>
            </v-card-text>
            <v-card-actions>
              <v-btn
                color="primary"
                variant="text"
                :href="project.githubUrl"
                target="_blank"
                prepend-icon="mdi-github"
              >
                View on GitHub
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn
                icon
                @click="toggleLike"
              >
                <v-icon>
                  {{ project.liked ? 'mdi-heart' : 'mdi-heart-outline' }}
                </v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <!-- GitHub Stats -->
        <v-col cols="12" md="6" v-if="project.githubUrl">
          <v-card>
            <v-card-title>GitHub Stats</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="4">
                  <div class="text-center">
                    <div class="text-h4">{{ githubStats.stars }}</div>
                    <div class="text-subtitle-1">Stars</div>
                  </div>
                </v-col>
                <v-col cols="4">
                  <div class="text-center">
                    <div class="text-h4">{{ githubStats.forks }}</div>
                    <div class="text-subtitle-1">Forks</div>
                  </div>
                </v-col>
                <v-col cols="4">
                  <div class="text-center">
                    <div class="text-h4">{{ githubStats.issues }}</div>
                    <div class="text-subtitle-1">Issues</div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Project Details -->
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Project Details</v-card-title>
            <v-card-text>
              <v-list>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>mdi-calendar</v-icon>
                  </template>
                  <v-list-item-title>Created</v-list-item-title>
                  <v-list-item-subtitle>{{ project.createdAt }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>mdi-update</v-icon>
                  </template>
                  <v-list-item-title>Last Updated</v-list-item-title>
                  <v-list-item-subtitle>{{ project.updatedAt }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>mdi-eye</v-icon>
                  </template>
                  <v-list-item-title>Views</v-list-item-title>
                  <v-list-item-subtitle>{{ project.views }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Comments Section -->
        <v-col cols="12">
          <v-card>
            <v-card-title>Comments</v-card-title>
            <v-card-text>
              <v-textarea
                v-model="newComment"
                label="Add a comment"
                rows="3"
                variant="outlined"
              ></v-textarea>
              <v-btn
                color="primary"
                @click="addComment"
                :disabled="!newComment.trim()"
              >
                Post Comment
              </v-btn>
            </v-card-text>
            <v-list>
              <v-list-item
                v-for="comment in comments"
                :key="comment.id"
                :subtitle="comment.author + ' • ' + comment.date"
              >
                <template v-slot:prepend>
                  <v-avatar color="primary">
                    {{ comment.author.charAt(0) }}
                  </v-avatar>
                </template>
                <v-list-item-title>{{ comment.content }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'ProjectDetailView',
  data() {
    return {
      project: {
        id: 1,
        title: 'Sample Project',
        description: 'This is a detailed description of the project. It includes information about the technologies used, the development process, and the challenges overcome.',
        image: 'https://via.placeholder.com/1200x400',
        author: 'John Doe',
        tags: ['Vue.js', 'Vuetify', 'GitHub API'],
        githubUrl: 'https://github.com/username/project',
        createdAt: '2024-01-01',
        updatedAt: '2024-03-15',
        views: 1234,
        liked: false
      },
      githubStats: {
        stars: 42,
        forks: 12,
        issues: 5
      },
      comments: [
        {
          id: 1,
          author: 'Jane Smith',
          date: '2024-03-15',
          content: 'This is an amazing project! I love how you implemented the GitHub integration.'
        },
        {
          id: 2,
          author: 'Mike Johnson',
          date: '2024-03-14',
          content: 'Great work! Would love to see more features in the future.'
        }
      ],
      newComment: ''
    }
  },
  methods: {
    toggleLike() {
      this.project.liked = !this.project.liked
      // Add API call here to update like status
    },
    addComment() {
      if (this.newComment.trim()) {
        this.comments.unshift({
          id: this.comments.length + 1,
          author: 'Current User', // Replace with actual user name
          date: new Date().toISOString().split('T')[0],
          content: this.newComment
        })
        this.newComment = ''
      }
    }
  },
  mounted() {
    // Fetch project details using this.$route.params.id
    console.log('Project ID:', this.$route.params.id)
    // Add API calls here to fetch project details and GitHub stats
  }
}
</script> 