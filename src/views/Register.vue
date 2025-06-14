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

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { GoogleLogin, decodeCredential } from 'vue3-google-login'

const router = useRouter()
const loading = ref(false)

const form = reactive({
  email: '',
  password: '',
  confirmPassword: ''
})

const rules = {
  required: v => !!v || 'This field is required',
  email: v => /.+@.+\..+/.test(v) || 'Email must be valid',
  password: v => v.length >= 8 || 'Password must be at least 8 characters',
  confirmPassword: v => v === form.password || 'Passwords must match'
}

const handleRegister = async () => {
  loading.value = true
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: form.email,
        password: form.password
      })
    })
    
    if (!response.ok) {
      throw new Error('Registration failed')
    }

    const data = await response.json()
    localStorage.setItem('user', JSON.stringify(data))
    router.push('/')
  } catch (error) {
    console.error('Registration error:', error)
  } finally {
    loading.value = false
  }
}

const handleGoogleLogin = async (response) => {
  const userData = decodeCredential(response.credential)
  console.log("Google user data:", userData)
  
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/google/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })
    
    if (!response.ok) {
      throw new Error('Google registration failed')
    }

    const data = await response.json()
    localStorage.setItem('user', JSON.stringify(data))
    router.push('/')
  } catch (error) {
    console.error('Google registration error:', error)
  }
}
</script> 