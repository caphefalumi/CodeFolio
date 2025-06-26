<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="mt-8">
          <v-card-title class="text-h4 text-center pt-6" id="register-heading">
            Create Account
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleRegister" aria-labelledby="register-heading">
              <v-text-field
                v-model="form.email"
                label="Email"
                type="email"
                required
                :rules="[rules.required, rules.email]"
                aria-describedby="email-register-help"
                autocomplete="email"
              ></v-text-field>

              <v-text-field
                v-model="form.username"
                label="Username"
                type="text"
                required
                :rules="[rules.required, rules.username]"
                aria-describedby="username-help"
                autocomplete="username"
              ></v-text-field>

              <v-text-field
                v-model="form.password"
                label="Password"
                type="password"
                required
                :rules="[rules.required, rules.password]"
                aria-describedby="password-register-help"
                autocomplete="new-password"
              ></v-text-field>
              <v-text-field
                v-model="form.confirmPassword"
                label="Confirm Password"
                type="password"
                required
                :rules="[rules.required, rules.confirmPassword]"
                aria-describedby="confirm-password-help"
                autocomplete="new-password"
              ></v-text-field>

              <v-btn
                type="submit"
                color="primary"
                block
                class="mt-4"
                :loading="loading"
                :disabled="!isFormValid"
                :style="isFormValid ? 'background-color: #43a047; color: #fff;' : 'background-color: #bdbdbd; color: #fff;'"
                :aria-label="loading ? 'Creating account...' : 'Create your account'"
              >
                Register
              </v-btn>
            </v-form>

            <v-divider class="my-4" aria-hidden="true"></v-divider>

            <div class="text-center">
              <p class="text-body-2 mb-2">Or register with</p>
              <GoogleLogin :callback="handleGoogleLogin" prompt auto-login/>
            </div>

            <div class="text-center mt-4">
              <router-link to="/login" class="text-decoration-none">
                Already have an account? Login
              </router-link>
            </div>

            <v-alert
              v-if="errorMessage"
              type="error"
              class="mb-4"
              border="start"
              colored-border
              elevation="0"
              density="comfortable"
              style="background-color: #fff; color: #d32f2f; font-weight: 500;"
              role="alert"
              aria-live="polite"
            >
              <template #prepend>
                <v-icon color="error" size="24" aria-hidden="true">mdi-alert-circle</v-icon>
              </template>
              {{ errorMessage }}
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios'
import { GoogleLogin, decodeCredential } from 'vue3-google-login'

export default {
  name: 'RegisterComponent',
  components: {
    GoogleLogin
  },
  data() {
    return {
      loading: false,
      form: {
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
      },
      rules: {
        required: v => !!v || 'This field is required',
        email: v => /.+@.+\..+/.test(v) || 'Email must be valid',
        username: v => /^[a-zA-Z0-9_]{3,20}$/.test(v) || 'Username must be 3-20 characters, letters, numbers, or underscores',
        password: v => v.length >= 8 || 'Password must be at least 8 characters',
        confirmPassword: v => v === this.form.password || 'Passwords must match'
      },
      errorMessage: '',
    }
  },
  computed: {
    isFormValid() {
      return (
        this.form.email &&
        this.rules.email(this.form.email) === true &&
        this.form.username &&
        this.rules.username(this.form.username) === true &&
        this.form.password &&
        this.rules.password(this.form.password) === true &&
        this.form.confirmPassword &&
        this.rules.confirmPassword(this.form.confirmPassword) === true
      );
    }
  },
  methods: {
    async handleRegister() {
      this.errorMessage = '';
      this.loading = true;
      try {
        await axios.post(`/api/auth/register`, {
          email: this.form.email,
          username: this.form.username,
          password: this.form.password
        })
        
        this.$router.push('/')

      } catch (error) {
        this.errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Registration failed. Please try again.';
      } finally {
        this.loading = false
      }
    },

    async handleGoogleLogin(response) {
      const userData = decodeCredential(response.credential)
      console.log("Google user data:", userData)
      
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/google/register`, userData)
        
        localStorage.setItem('user', JSON.stringify(response.data))
        this.$router.push('/')

      } catch (error) {
        console.error('Google registration error:', error.response?.data || error.message)
      }
    }
  }
}
</script>
