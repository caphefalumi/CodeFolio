<template>
  <v-app>
    <!-- Skip Links for Accessibility -->
    <div class="skip-links">
      <a href="#main-content" class="skip-link">Skip to main content</a>
      <a href="#navigation" class="skip-link">Skip to navigation</a>
    </div>

    <v-app-bar app color="primary" dark role="banner" id="navigation">
      <v-app-bar-title>
        <router-link to="/" class="text-decoration-none text-white" aria-label="CodeFolio Home">
          CodeFolio
        </router-link>
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn 
        icon 
        @click="toggleTheme" 
        :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
        :title="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
      >
        <v-icon>{{ isDark ? 'mdi-weather-night' : 'mdi-weather-sunny' }}</v-icon>
      </v-btn>
      <v-btn to="/" text aria-label="Navigate to Home">Home</v-btn>
      <v-btn to="/projects" text aria-label="Navigate to Projects">Projects</v-btn>
      <v-menu v-if="isAuthenticated" offset-y>
        <template #activator="{ props }">
          <v-btn 
            icon 
            v-bind="props" 
            :aria-label="`User menu for ${username}`"
            aria-haspopup="true"
          >
            <v-avatar size="32" v-if="avatar">
              <v-img 
                :src="avatar" 
                :alt="`${username} profile picture`" 
                cover
              ></v-img>
            </v-avatar>
            <v-avatar v-else size="32" class="bg-grey lighten-2">
              <v-icon aria-hidden="true">mdi-account</v-icon>
            </v-avatar>
          </v-btn>        </template>
        <v-list role="menu">
          <v-list-item :to="`/${username}`" role="menuitem">
            <v-list-item-title>Profile</v-list-item-title>
          </v-list-item>
          <v-list-item @click="logout" role="menuitem">
            <v-list-item-title>Log out</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-btn v-else to="/login" text aria-label="Navigate to Login">Login</v-btn>
    </v-app-bar>

    <v-main role="main" id="main-content" tabindex="-1">
      <v-container>
        <router-view></router-view>
      </v-container>
    </v-main>

    <v-footer app color="primary" dark role="contentinfo">
      <v-row justify="center" no-gutters>
        <v-col class="text-center" cols="12">
          {{ new Date().getFullYear() }} — <strong>CodeFolio</strong>
        </v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>

<script>
import axios from 'axios'
import { fetchCurrentUser }from '@/composables/user.js'
export default {
  name: 'App',
  data() {
    return {
      isAuthenticated: false,
      user: null,
      username: '',
      avatar: '',
      isDark: false
    }
  },
  mounted() {
    this.fetchToken();
    this.loadThemePreference();
  },
  methods: {
    async fetchProfile() {
      try {
        this.user = await fetchCurrentUser();
        this.username = this.user.username;
        this.avatar = this.user.avatar;
        console.log('User profile fetched:', this.avatar, this.username);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    },
    fetchToken() {
      console.log('Checking for access token in sessionStorage...');
      const token = sessionStorage.getItem('accessToken');
      if (token) {
        axios.post('/api/auth/validate', {}, { headers: { Authorization: `Bearer ${token}` } })
          .then(response => {
            if (response.data.valid) {
              this.isAuthenticated = true;
              this.fetchProfile();
              console.log('Token is valid:', token);
            } else {
              console.warn('Token is invalid, fetching new token...');
              this.getNewToken();
            }
          })
          .catch(error => {
            console.error('Error validating token:', error);
            this.getNewToken();
          });
        console.log('Access token found in sessionStorage:', token);
        return;
      } else {
        this.getNewToken();
      }

    },
    getNewToken() {
      axios.post('/api/auth/token', {}, { withCredentials: true })
        .then(response => {
          console.log('New access token fetched:', response.data.accessToken);
          sessionStorage.setItem('accessToken', response.data.accessToken);
          this.isAuthenticated = true;
          this.fetchToken();
        })
        .catch(error => {
          console.error('Error fetching new token:', error);
          sessionStorage.removeItem('accessToken');
          this.isAuthenticated = false;
        });
    },
    toggleTheme() {
      this.isDark = !this.isDark
      this.$vuetify.theme.global.name = this.isDark ? 'dark' : 'light'
      localStorage.setItem('theme', this.isDark ? 'dark' : 'light')
    },
    loadThemePreference() {
      const savedTheme = localStorage.getItem('theme')
      if (!savedTheme) {
        this.isDark = false;
        this.$vuetify.theme.global.name = 'light';
        localStorage.setItem('theme', 'light');
        return;
      }
      this.isDark = savedTheme === 'dark'
      this.$vuetify.theme.global.name = this.isDark ? 'dark' : 'light'
    },
    logout() {
      axios.post('/api/auth/logout', {}, { withCredentials: true })
        .then(() => {
          sessionStorage.removeItem('accessToken');
          this.isAuthenticated = false;
          this.user = null;
          this.username = '';
          this.avatar = '';
          this.$router.push('/login');
        })
        .catch(error => {
          console.error('Error logging out:', error);
          sessionStorage.removeItem('accessToken');
          this.isAuthenticated = false;
          this.user = null;
          this.username = '';
          this.avatar = '';
          this.$router.push('/login');
        });
    },
  },

  watch: {
    '$route'() {
      this.fetchToken();
    }
  }

}
</script>