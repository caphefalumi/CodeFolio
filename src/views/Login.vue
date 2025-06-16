<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="mt-8">
          <v-card-title class="text-h4 text-center pt-6">
            Login
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="form.email"
                label="Email"
                type="email"
                required
                :rules="[rules.required, rules.email]"
              ></v-text-field>

              <v-text-field
                v-model="form.password"
                label="Password"
                type="password"
                required
                :rules="[rules.required]"
              ></v-text-field>
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

              <v-btn
                type="submit"
                color="primary"
                block
                class="mt-4"
                :loading="loading"
              >Login</v-btn>
            </v-form>

            <v-divider class="my-4"></v-divider>

            <div class="text-center">
              <p class="text-body-2 mb-2">Or login with</p>
              <GoogleLogin :callback="handleGoogleLogin" prompt auto-login/>
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

export default {
  components: {
    GoogleLogin
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
  methods: {
    async handleLogin() {
      this.loading = true
      this.errorMessage = ''
      try {
        const response = await axios.post('/api/users/login/jwt', {
          email: this.form.email,
          password: this.form.password
        }, {
          withCredentials: true
        })
        console.log(response.data)
        sessionStorage.setItem('accessToken', response.data.accessToken)

        this.$router.push('/')
      } catch (error) {
        console.error('Login error:', error)
        if (error.response && error.response.status === 401) {
          this.errorMessage = 'Invalid email or password'
        } else {
          this.errorMessage = 'Something went wrong. Please try again'
        }
      } finally {
        this.loading = false
      }
    },
    async handleGoogleLogin(response) {
      
    }
  }
}
</script>
