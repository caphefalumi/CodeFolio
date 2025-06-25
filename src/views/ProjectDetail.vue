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
              <v-btn icon @click="upvoteProject" :disabled="project.upvoting">
                <v-icon color="success">mdi-arrow-up-bold</v-icon>
              </v-btn>
              <span class="mx-2">{{ project.upvotes - project.downvotes }}</span>
              <v-btn icon @click="downvoteProject" :disabled="project.downvoting">
                <v-icon color="error">mdi-arrow-down-bold</v-icon>
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
              <v-alert
                v-if="errorMessage"
                type="error"
                class="mb-4"
                border="start"
                colored-border
                elevation="0"
                density="comfortable"
                style="background-color: #fff; color: #d32f2f; font-weight: 500;"
              >
                <template #prepend>
                  <v-icon color="error" size="24">mdi-alert-circle</v-icon>
                </template>
                {{ errorMessage }}
              </v-alert>
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

    <!-- Move the auth banner outside the comment section and make it fixed at the top -->
    <v-alert
      v-if="showAuthBanner"
      type="warning"
      class="mb-4 fade-banner auth-banner-fixed text-center"
      border="start"
      colored-border
      elevation="0"
      density="comfortable"
      style="background-color: #fffbe7; color: #b26a00; font-weight: 500; transition: opacity 1s; z-index: 9999;"
    >
      <template #prepend>
        <v-icon color="warning" size="24">mdi-alert</v-icon>
      </template>
      <div class="banner-center">You must be logged in to vote on projects.</div>
    </v-alert>
  </div>
</template>

<script>
import axios from 'axios'
import { getAccessToken } from '@/composables/user.js'

export default {
  name: 'ProjectDetailView',
  data() {
    return {
      project: {
        title: '',
        description: '',
        image: '',
        author: '',
        tags: [],
        githubUrl: '',
        createdAt: '',
        updatedAt: '',
        views: 0,
        upvotes: 0,
        downvotes: 0,
        upvoting: false,
        downvoting: false
      },
      githubStats: { stars: 0, forks: 0, issues: 0 },
      comments: [],
      newComment: '',
      errorMessage: '',
      showAuthBanner: false,
      authBannerTimeout: null,
      loading: false
    }
  },
  methods: {
    async fetchProjectDetail() {
      try {
        const { username, id } = this.$route.params
        const res = await axios.get(`/api/posts/${username}/${id}`)
        const post = res.data

        // Detect if user has upvoted/downvoted (if you have user info, add logic here)
        this.project = {
          title: post.title,
          description: post.description,
          image: post.coverImage,
          author: post.author.username,
          tags: post.tags || [],
          githubUrl: post.githubUrl,
          createdAt: new Date(post.createdAt).toLocaleDateString(),
          updatedAt: new Date(post.updatedAt).toLocaleDateString(),
          views: post.views,
          upvotes: post.upvotes || 0,
          downvotes: post.downvotes || 0,
          upvoting: false,
          downvoting: false,
          // Optionally, add logic to check if current user has upvoted/downvoted
        }

        this.comments = (post.comments || []).map(c => ({
          id: c._id,
          author: c.user.username,
          date: new Date(c.createdAt).toLocaleDateString(),
          content: c.content
        }))

        if (this.project.githubUrl) {
          this.fetchGitHubStats()
        }
      } catch (err) {
        console.error('Error fetching project detail:', err)
      }
    },
    async fetchGitHubStats() {
      try {
        const apiUrl = this.project.githubUrl
          .replace('https://github.com/', 'https://api.github.com/repos/')
        const res = await axios.get(apiUrl)
        const { stargazers_count, forks_count, open_issues_count } = res.data
        this.githubStats = {
          stars: stargazers_count,
          forks: forks_count,
          issues: open_issues_count
        }
      } catch (err) {
        console.error('Error fetching GitHub stats:', err)
      }
    },
    toggleLike() {
      this.project.liked = !this.project.liked
      // TODO: Add API call to upvote/downvote
    },
    async addComment() {
      this.errorMessage = '';
      this.loading = true;
      try {
        if (!this.newComment.trim()) return
        const token = getAccessToken()
        const res = await axios.post(
          `/api/posts/${this.$route.params.id}/comments`,
          { content: this.newComment },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        this.comments.unshift({
          id: `c${Date.now()}`,
          author: 'You',
          date: new Date().toLocaleDateString(),
          content: this.newComment
        })
        this.newComment = ''
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Failed to post comment. Please try again.';
      } finally {
        this.loading = false;
      }
    },
    async upvoteProject() {
      this.project.upvoting = true
      try {
        const res = await axios.post(`/api/posts/${this.$route.params.id}/upvote`)
        this.project.upvotes = res.data.upvotes
        this.project.downvotes = res.data.downvotes
      } catch (error) {
        if (error.response && error.response.status === 401) {
          this.showAuthBanner = true
          clearTimeout(this.authBannerTimeout)
          this.authBannerTimeout = setTimeout(() => {
            this.showAuthBanner = false
          }, 5000)
        } else {
          this.errorMessage = error.response?.data?.message || error.message || 'Failed to upvote.'
        }
      } finally {
        this.project.upvoting = false
      }
    },
    async downvoteProject() {
      this.project.downvoting = true
      try {
        const res = await axios.post(`/api/posts/${this.$route.params.id}/downvote`)
        this.project.upvotes = res.data.upvotes
        this.project.downvotes = res.data.downvotes
      } catch (error) {
        if (error.response && error.response.status === 401) {
          this.showAuthBanner = true
          clearTimeout(this.authBannerTimeout)
          this.authBannerTimeout = setTimeout(() => {
            this.showAuthBanner = false
          }, 5000)
        } else {
          this.errorMessage = error.response?.data?.message || error.message || 'Failed to downvote.'
        }
      } finally {
        this.project.downvoting = false
      }
    }
  },
  mounted() {
    this.fetchProjectDetail()
  }
}
</script>

<style scoped>
.fade-banner {
  opacity: 1;
  transition: opacity 1s;
}
.fade-banner[style*="display: none"] {
  opacity: 0;
}
.auth-banner-fixed {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  min-width: 320px;
  max-width: 90vw;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  pointer-events: none;
}
.banner-center {
  text-align: center;
  width: 100%;
}
</style>