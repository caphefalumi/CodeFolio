<template>
  <div>
    <v-container>
      <v-row v-auto-animate>
        <!-- Project Header -->
        <v-col cols="12">
          <article>
            <v-card>
              <v-img :src="project.image" height="400" cover :alt="`${project.title} project cover image`"></v-img>
              <v-card-title class="text-h3"><h1>{{ project.title }}</h1></v-card-title>
              <v-card-subtitle>By <span>{{ project.author }}</span></v-card-subtitle>
              <v-card-text>
                <p class="text-body-1 mb-4">{{ project.description }}</p>
                <div>
                  <v-chip v-for="tag in project.tags" :key="tag" class="mr-2 mb-2">{{ tag }}</v-chip>
                </div>
              </v-card-text>
              <v-card-actions class="justify-center align-center">
                <v-btn icon @click="upvoteProject" :disabled="project.upvoting" class="mr-2" :aria-label="`Upvote project. Current score: ${project.upvotes - project.downvotes}`">
                  <v-icon :color="project.liked === true ? 'success' : 'grey'" aria-hidden="true">mdi-arrow-up-bold</v-icon>
                </v-btn>
                <div class="text-h5 font-weight-bold mx-2" style="min-width: 32px; text-align: center;" aria-live="polite">
                  {{ project.upvotes - project.downvotes }}
                </div>
                <v-btn icon @click="downvoteProject" :disabled="project.downvoting" class="ml-2" :aria-label="`Downvote project. Current score: ${project.upvotes - project.downvotes}`">
                  <v-icon :color="project.liked === false ? 'error' : 'grey'" aria-hidden="true">mdi-arrow-down-bold</v-icon>
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn color="primary" variant="text" :href="project.githubUrl" target="_blank" prepend-icon="mdi-github" rel="noopener noreferrer" aria-label="View project on GitHub (opens in new tab)">
                  View on GitHub
                </v-btn>
              </v-card-actions>            </v-card>
          </article>
        </v-col>
        
        <!-- Project Content Section -->
        <v-col cols="12" v-if="project.content">
          <section aria-labelledby="project-content-heading">
            <v-card>
              <v-card-title><h2 id="project-content-heading">Project Content</h2></v-card-title>
              <v-card-text>
                <div class="project-content" v-html="project.content"></div>
              </v-card-text>
            </v-card>
          </section>
        </v-col>

        <!-- GitHub Stats -->
        <v-col cols="12" md="6" v-if="project.githubUrl">
          <section aria-labelledby="github-stats-heading">
            <v-card>
              <v-card-title><h2 id="github-stats-heading">GitHub Stats</h2></v-card-title>
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
          </section>
        </v-col>
        <!-- Project Details -->
        <v-col cols="12" md="6">
          <section aria-labelledby="project-details-heading">
            <v-card>
              <v-card-title><h2 id="project-details-heading">Project Details</h2></v-card-title>
              <v-card-text>
                <v-list>
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon aria-hidden="true">mdi-calendar</v-icon>
                    </template>
                    <v-list-item-title>Created</v-list-item-title>
                    <v-list-item-subtitle>{{ project.createdAt }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon aria-hidden="true">mdi-update</v-icon>
                    </template>
                    <v-list-item-title>Last Updated</v-list-item-title>
                    <v-list-item-subtitle>{{ project.updatedAt }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon aria-hidden="true">mdi-eye</v-icon>
                    </template>
                    <v-list-item-title>Views</v-list-item-title>
                    <v-list-item-subtitle>{{ project.views }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </section>
        </v-col>
        <!-- Comments Section -->
        <v-col cols="12">
          <section aria-labelledby="comments-heading">            <v-card>
              <v-card-title><h2 id="comments-heading">Comments</h2></v-card-title>
              <v-card-text>
                <app-alert
                  v-if="errorMessage"
                  type="error"
                  :message="errorMessage"
                  custom-class="mb-4"
                />
                <app-form
                  :loading="loading"
                  submit-button-text="Post Comment"
                  :submit-button-disabled="!newComment.trim()"
                  @submit="addComment"
                >
                  <v-textarea v-model="newComment" label="Add a comment" rows="3" variant="outlined"></v-textarea>
                </app-form>
              </v-card-text>
              <v-list v-auto-animate aria-label="Project comments">
                <v-list-item v-for="comment in comments" :key="comment.id" :subtitle="comment.author + ' • ' + comment.date" role="article" :aria-label="`Comment by ${comment.author} on ${comment.date}`">
                  <template v-slot:prepend>
                    <v-avatar color="primary" :aria-label="`${comment.author} avatar`">{{ comment.author.charAt(0) }}</v-avatar>
                  </template>
                  <v-list-item-title>{{ comment.content }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card>
          </section>
        </v-col>
      </v-row>
    </v-container>
    <!-- Move the auth banner outside the comment section and make it fixed at the top -->
    <v-alert v-if="showAuthBanner" type="warning" class="mb-4 fade-banner auth-banner-fixed text-center" border="start" colored-border elevation="0" density="comfortable" style="background-color: #fffbe7; color: #b26a00; font-weight: 500; transition: opacity 1s; z-index: 9999;">
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
import { useApi } from '@/composables/common.js'
import AppAlert from '@/components/ui/AppAlert.vue'
import AppForm from '@/components/ui/AppForm.vue'

export default {
  name: 'ProjectDetailView',
  components: {
    AppAlert,
    AppForm
  },
  setup() {
    const { handleError } = useApi()
    return { handleError }
  },
  data() {
    return {      project: {
        title: '',
        description: '',
        content: '',
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
        let headers = {}
        const token = getAccessToken && getAccessToken()
        if (token) headers.Authorization = `Bearer ${token}`
        const res = await axios.get(`/api/posts/${username}/${id}`, { headers })
        const post = res.data        
        this.project = {
          title: post.title,
          description: post.description,
          content: post.content,
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
          liked: post.liked // <-- set vote state from backend
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
      try {        if (!this.newComment.trim()) return;
        const token = getAccessToken();const res = await axios.post(
          `/api/posts/${this.$route.params.id}/comments`,
          { content: this.newComment },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.comments.unshift({
          id: `c${Date.now()}`,
          author: 'You',
          date: new Date().toLocaleDateString(),
          content: this.newComment
        });
        this.newComment = '';
      } catch (error) {
        this.errorMessage = this.handleError(error, 'Failed to post comment. Please try again.');
      } finally {
        this.loading = false;
      }
    },
    async upvoteProject() {
      if (this.project.upvoting) return;
      this.project.upvoting = true;
      try {
        const token = getAccessToken();
        const res = await axios.post(
          `/api/posts/${this.$route.params.id}/upvote`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.project.upvotes = res.data.upvotes;
        this.project.downvotes = res.data.downvotes;
        this.project.liked = res.data.liked;
      } catch (error) {
        this.handleVoteError(error);
      } finally {
        this.project.upvoting = false;
      }
    },
    async downvoteProject() {
      if (this.project.downvoting) return;
      this.project.downvoting = true;
      try {
        const token = getAccessToken();
        const res = await axios.post(
          `/api/posts/${this.$route.params.id}/downvote`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.project.upvotes = res.data.upvotes;
        this.project.downvotes = res.data.downvotes;
        this.project.liked = res.data.liked;
      } catch (error) {
        this.handleVoteError(error);
      } finally {
        this.project.downvoting = false;
      }
    },
    handleVoteError(error) {
      if (error.response && error.response.status === 401) {
        this.showAuthBanner = true;
        clearTimeout(this.authBannerTimeout);
        this.authBannerTimeout = setTimeout(() => {          this.showAuthBanner = false;
        }, 5000);
      } else {
        this.errorMessage = this.handleError(error, 'Failed to vote.');
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

.project-content {
  line-height: 1.6;
  font-family: inherit;
}

.project-content h1,
.project-content h2,
.project-content h3 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
}

.project-content p {
  margin-bottom: 1em;
}

.project-content ul,
.project-content ol {
  margin-bottom: 1em;
  padding-left: 1.5em;
}

.project-content blockquote {
  border-left: 4px solid #e0e0e0;
  padding-left: 1em;
  margin: 1em 0;
  font-style: italic;
  color: #666;
}

.project-content pre {
  background-color: #f5f5f5;
  padding: 1em;
  border-radius: 4px;
  overflow-x: auto;
  margin: 1em 0;
}

.project-content code {
  background-color: #f5f5f5;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

.project-content img {
  max-width: 100%;
  height: auto;
  margin: 1em 0;
}

</style>