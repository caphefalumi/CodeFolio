<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="mt-8">
          <v-card-title class="text-h4 text-center pt-6">
            Create Account
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleRegister">
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
                :rules="[rules.required, rules.password]"
              ></v-text-field>

              <v-text-field
                v-model="form.confirmPassword"
                label="Confirm Password"
                type="password"
                required
                :rules="[rules.required, rules.confirmPassword]"
              ></v-text-field>

              <v-btn
                type="submit"
                color="primary"
                block
                class="mt-4"
                :loading="loading"
              >
                Register
              </v-btn>
            </v-form>

            <v-divider class="my-4"></v-divider>

            <div class="text-center">
              <p class="text-body-2 mb-2">Or register with</p>
              <GoogleLogin :callback="handleGoogleLogin" prompt auto-login/>
            </div>

            <div class="text-center mt-4">
              <router-link to="/login" class="text-decoration-none">
                Already have an account? Login
              </router-link>
            </div>
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
        password: '',
        confirmPassword: ''
      },
      rules: {
        required: v => !!v || 'This field is required',
        email: v => /.+@.+\..+/.test(v) || 'Email must be valid',
        password: v => v.length >= 8 || 'Password must be at least 8 characters',
        // Note: We use 'this' here to access the component's data
        confirmPassword: v => v === this.form.password || 'Passwords must match'
      }
    }
  },
  methods: {
    async handleRegister() {
      this.loading = true
      try {
        // Axios automatically sets Content-Type and stringifies the body
        await axios.post(`/api/auth/register`, {
          email: this.form.email,
          password: this.form.password
        })
        
        // Axios provides response data in the 'data' property
        this.$router.push('/')

      } catch (error) {
        // Axios throws an error for non-2xx responses, which is caught here
        console.error('Registration error:', error.response?.data || error.message)
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