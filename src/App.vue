<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-app-bar-title>
        <router-link to="/" class="text-decoration-none text-white">
          CodeFolio
        </router-link>
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn to="/" text>Home</v-btn>
      <v-btn to="/projects" text>Projects</v-btn>
      <v-btn v-if="isAuthenticated" :to="`/${username}`" text>Profile</v-btn>
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
      username: ''
    }
  },
  mounted() {
    this.fetchToken();
    this.fetchProfile();
  },
  methods: {
    async fetchProfile() {
      try {
        this.user = await fetchCurrentUser();
        this.username = this.user.username;
        console.log('User profile fetched:', this.user);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    },
    fetchToken() {
      const token = sessionStorage.getItem('accessToken');
      if (token) {
        this.isAuthenticated = true;
        console.log('Access token found in sessionStorage:', token);
        return;
      }
      axios.post('/api/auth/token', {}, { withCredentials: true })
        .then(response => {
          console.log('Access token fetched:', response.data.accessToken)
          sessionStorage.setItem('accessToken', response.data.accessToken)
          this.isAuthenticated = true
        })
        .catch(error => {
          console.error('Error fetching token:', error)
        });
    }
  },
  watch: {
    '$route'() {
      this.fetchToken();
    }
  }

}
</script>