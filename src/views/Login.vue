<template>
  <div>
    <v-container class="fill-height">
      <v-row justify="center">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card class="elevation-12">
            <v-toolbar color="primary" dark flat>
              <v-toolbar-title>Login</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <v-form @submit.prevent="handleLogin">
                <v-text-field
                  v-model="email"
                  label="Email"
                  name="email"
                  prepend-icon="mdi-email"
                  type="email"
                  required
                  :rules="[rules.required, rules.email]"
                ></v-text-field>
                <v-text-field
                  v-model="password"
                  label="Password"
                  name="password"
                  prepend-icon="mdi-lock"
                  type="password"
                  required
                  :rules="[rules.required]"
                ></v-text-field>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                @click="handleLogin"
                :loading="loading"
              >
                Login
              </v-btn>
            </v-card-actions>
            <v-card-text class="text-center">
              <p class="mb-0">Or login with</p>
              <GoogleLogin :callback="handleGoogleLogin" prompt auto-login/>
            </v-card-text>
            <v-card-text class="text-center">
              <p class="mb-0">Don't have an account?</p>
              <v-btn
                variant="text"
                color="primary"
                @click="showRegister = true"
              >
                Register
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Register Dialog -->
    <v-dialog v-model="showRegister" max-width="500">
      <v-card>
        <v-toolbar color="primary" dark flat>
          <v-toolbar-title>Register</v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-form @submit.prevent="handleRegister">
            <v-text-field
              v-model="registerForm.name"
              label="Name"
              required
            ></v-text-field>
            <v-text-field
              v-model="registerForm.email"
              label="Email"
              type="email"
              required
            ></v-text-field>
            <v-text-field
              v-model="registerForm.password"
              label="Password"
              type="password"
              required
            ></v-text-field>
            <v-text-field
              v-model="registerForm.confirmPassword"
              label="Confirm Password"
              type="password"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="handleRegister"
            :loading="loading"
          >
            Register
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { GoogleLogin, decodeCredential } from 'vue3-google-login'

export default {
  name: 'LoginView',
  components: {
    GoogleLogin
  },
  data() {
    return {
      email: '',
      password: '',
      loading: false,
      showRegister: false,
      registerForm: {
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      rules: {
        required: v => !!v || 'This field is required',
        email: v => /.+@.+\..+/.test(v) || 'Email must be valid'
      }
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true
      try {
        // Add your login logic here
        // For now, we'll just simulate a successful login
        await new Promise(resolve => setTimeout(resolve, 1000))
        localStorage.setItem('user', JSON.stringify({ email: this.email }))
        this.$router.push('/profile')
      } catch (error) {
        console.error('Login failed:', error)
      } finally {
        this.loading = false
      }
    },
    async handleRegister() {
      this.loading = true
      try {
        // Add your registration logic here
        // For now, we'll just simulate a successful registration
        await new Promise(resolve => setTimeout(resolve, 1000))
        this.showRegister = false
        // You might want to automatically log the user in after registration
      } catch (error) {
        console.error('Registration failed:', error)
      } finally {
        this.loading = false
      }
    },
    handleGoogleLogin(response) {
      const userData = decodeCredential(response.credential)
      console.log("Google user data:", userData)
      // TODO: Implement your Google login logic here
      this.$router.push('/')
    }
  }
}
</script> 