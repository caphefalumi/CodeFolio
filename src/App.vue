<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-app-bar-title>
        <router-link to="/" class="text-decoration-none text-white">
          CodeFolio
        </router-link>
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="toggleTheme">
        <v-icon>{{ isDark ? 'mdi-weather-night' : 'mdi-weather-sunny' }}</v-icon>
      </v-btn>
      <v-btn to="/" text>Home</v-btn>
      <v-btn to="/projects" text>Projects</v-btn>
      <v-btn v-if="isAuthenticated" :to="`/${username}`" class="pa-0" style="min-width: 0;">
      <v-avatar size="32" v-if="avatar">
        <v-img :src="avatar" alt="User avatar" cover></v-img>
      </v-avatar>

        <v-avatar v-else size="32" class="bg-grey lighten-2">
          <v-icon>mdi-account</v-icon>
        </v-avatar>
      </v-btn>
      <v-btn v-else to="/login" text>Login</v-btn>
    </v-app-bar>

    <v-main>
      <v-container>
        <router-view></router-view>
      </v-container>
    </v-main>

    <v-footer app color="primary" dark>
      <v-row justify="center" no-gutters>
        <v-col class="text-center" cols="12">
          {{ new Date().getFullYear() }} — <strong>CodeFolio</strong>
        </v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>

<style>
#app {
  font-family: 'Roboto', sans-serif
}
</style>
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
    }
  },

  watch: {
    '$route'() {
      this.fetchToken();
    }
  }

}
</script>