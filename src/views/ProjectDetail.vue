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
        liked: false
      },
      githubStats: { stars: 0, forks: 0, issues: 0 },
      comments: [],
      newComment: ''
    }
  },
  methods: {
    async fetchProjectDetail() {
      try {
        const { username, id } = this.$route.params
        const res = await axios.get(`/api/posts/${username}/${id}`)
        const post = res.data

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
          liked: false
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
      if (!this.newComment.trim()) return
      try {
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
      } catch (err) {
        console.error('Error posting comment:', err)
      }
    }
  },
  mounted() {
    this.fetchProjectDetail()
  }
}
</script>