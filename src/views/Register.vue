<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="mt-8">
          <v-card-title class="text-h4 text-center pt-6" id="register-heading">Create Account</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleRegister" aria-labelledby="register-heading">
              <v-row>
                <v-col cols="6"><v-text-field v-model="form.firstName" label="First Name" type="text" required :rules="[rules.required, rules.name]" autocomplete="given-name"></v-text-field></v-col>
                <v-col cols="6"><v-text-field v-model="form.lastName" label="Last Name" type="text" required :rules="[rules.required, rules.name]" autocomplete="family-name"></v-text-field></v-col>
              </v-row>
              <v-text-field v-model="form.email" label="Email" type="email" required :rules="[rules.required, rules.email]" autocomplete="email"></v-text-field>
              <v-text-field v-model="form.username" label="Username" type="text" required :rules="[rules.required, rules.username]" autocomplete="username"></v-text-field>
              <v-text-field v-model="form.password" label="Password" type="password" required :rules="[rules.required, rules.password]" autocomplete="new-password"></v-text-field>
              <v-btn type="submit" color="primary" block class="mt-4" :loading="loading">Register</v-btn>
            </v-form>
            <v-alert v-if="errorMessage" type="error" class="mt-4" border="start" colored-border elevation="0" density="comfortable" style="background-color: #fff; color: #d32f2f; font-weight: 500;" role="alert" aria-live="polite"><template #prepend><v-icon color="error" size="24" aria-hidden="true">mdi-alert-circle</v-icon></template>{{ errorMessage }}</v-alert>
            <div class="mt-4 text-center">Already have an account? <router-link to="/login">Login</router-link></div>
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
  },  data() {
    return {
      loading: false,
      form: {
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
      },
      rules: {
        required: v => !!v || 'This field is required',
        name: v => {
          if (!v) return 'This field is required'
          if (v.length < 2) return 'Name must be at least 2 characters'
          if (v.length > 50) return 'Name must be less than 50 characters'
          if (!/^[a-zA-Z\s'-]+$/.test(v)) return 'Name can only contain letters, spaces, hyphens, and apostrophes'
          return true
        },
        email: v => /.+@.+\..+/.test(v) || 'Email must be valid',
        username: v => /^[a-zA-Z0-9_]{3,20}$/.test(v) || 'Username must be 3-20 characters, letters, numbers, or underscores',
        password: v => {
          if (!v) return 'Password is required'
          if (v.length < 8) return 'Password must be at least 8 characters'
          if (!/(?=.*[a-z])/.test(v)) return 'Password must contain at least one lowercase letter'
          if (!/(?=.*[A-Z])/.test(v)) return 'Password must contain at least one uppercase letter'
          if (!/(?=.*\d)/.test(v)) return 'Password must contain at least one number'
          if (!/(?=.*[@$!%*?&])/.test(v)) return 'Password must contain at least one special character (@$!%*?&)'
          return true
        },
        confirmPassword: v => v === this.form.password || 'Passwords must match'
      },
      errorMessage: '',
    }
  },  computed: {
    isFormValid() {
      return (
        this.form.firstName &&
        this.rules.name(this.form.firstName) === true &&
        this.form.lastName &&
        this.rules.name(this.form.lastName) === true &&
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
  methods: {    async handleRegister() {
      this.errorMessage = '';
      this.loading = true;
      try {
        await axios.post(`/api/auth/register`, {
          firstName: this.form.firstName,
          lastName: this.form.lastName,
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
