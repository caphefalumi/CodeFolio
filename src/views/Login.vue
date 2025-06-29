<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">        <v-card class="mt-8">
          <v-card-title class="text-h4 text-center pt-6" id="login-heading">Login</v-card-title>
          <v-card-text>
            <app-form
              :loading="loading"
              :error-message="errorMessage"
              submit-button-text="Login"
              :submit-button-block="true"
              submit-button-class="mt-4"
              aria-labelled-by="login-heading"
              @submit="handleLogin"
            >
              <v-text-field v-model="form.email" label="Email" type="email" required :rules="[rules.required, rules.email]" autocomplete="email"></v-text-field>
              <v-text-field v-model="form.password" label="Password" type="password" required :rules="[rules.required]" autocomplete="current-password"></v-text-field>
            </app-form>
            <v-divider class="my-4" aria-hidden="true"></v-divider>
            <div class="text-center text-body-2 mb-2">
              <span>Or login with</span>
            </div>
            <div class="login-buttons">
              <GoogleLogin :callback="handleGoogleLogin" auto-login popup-type="TOKEN">
                <v-icon-login provider="google" />
              </GoogleLogin>
              <div class="login-btn-wrapper">
                <v-icon-login provider="github" @click="handleGithubLogin" />
              </div>
            </div>
            <div class="text-center mt-4">
              <router-link to="/register" class="text-decoration-none">
                Don't have an account? Register
              </router-link>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { GoogleLogin } from 'vue3-google-login'
import axios from 'axios'
import vIconLogin from '@/components/vIconLogin.vue'
import AppForm from '@/components/ui/AppForm.vue'
import { useApi } from '@/composables/common.js'

export default {
  components: {
    GoogleLogin,
    vIconLogin,
    AppForm  },
  setup() {
    const { handleError } = useApi()
    return { handleError }
  },
  data() {
    return {
      loading: false,
      errorMessage: '',
      form: {
        email: '',
        password: ''
      },
      rules: {
        required: v => !!v || 'This field is required',
        email: v => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v) || 'Email must be valid'
      }
    }
  },
  mounted() {
    window.addEventListener('message', this.receiveGithubToken)
  },
  beforeUnmount() {
    window.removeEventListener('message', this.receiveGithubToken)
  },
  methods: {    async handleLogin() {
      this.errorMessage = '';
      this.loading = true;
      try {
        const response = await axios.post('/api/auth/login/jwt',
          {
            email: this.form.email,
            password: this.form.password,
          },
          { withCredentials: true }
        );
        sessionStorage.setItem('accessToken', response.data.accessToken);
        this.$router.push('/');
      } catch (error) {
        this.errorMessage = this.handleError(error, 'Login failed. Please try again.');
      } finally {
        this.loading = false;
      }
    },

    async handleGoogleLogin(response) {
      this.errorMessage = '';
      this.loading = true;
      try {
        const res = await axios.post(
          '/api/auth/login/google',
          { token: response.access_token }
        );
        sessionStorage.setItem('accessToken', res.data.accessToken);
        window.location.href = '/';
      } catch (error) {
        this.errorMessage = this.handleError(error, 'Google login failed. Please try again.');
      } finally {
        this.loading = false;
      }
    },

    handleGithubLogin() {
      this.errorMessage = '';
      window.open(
        '/api/auth/login/github',
        'GitHub Login',
        'width=500,height=600'
      );
    },

    receiveGithubToken(event) {
      if (event.origin !== 'http://localhost:3001') return;
      const { accessToken, error: githubError } = event.data || {};
      if (accessToken) {
        sessionStorage.setItem('accessToken', accessToken);
        window.location.href = '/';
      } else if (githubError) {
        this.errorMessage = githubError;
      }
    }
  }
}
</script>

<style scoped>
.login-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1em;
}


.shrink {
  width: 1px;
}
</style>