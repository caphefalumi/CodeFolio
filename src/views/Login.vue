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

              <v-btn
                type="submit"
                color="primary"
                block
                class="mt-4"
                :loading="loading"
              >
                Login
              </v-btn>
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
import { ref, reactive } from 'vue'
import { GoogleLogin } from 'vue3-google-login'
import axios from 'axios'

export default {
  components: {
    GoogleLogin
  },
  setup() {
    const loading = ref(false)

    const form = reactive({
      email: '',
      password: ''
    })

    const rules = {
      required: v => !!v || 'This field is required',
      email: v => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v) || 'Email must be valid'
    }

    const handleLogin = async () => {
      try {
        loading.value = true
        const response = await axios.get('http://localhost:3001/api/login', {
          params: {
            email: form.email,
            password: form.password
          }
        })
        console.log(response.data)
      } catch (error) {
        console.error('Login error:', error)
      } finally {
        loading.value = false
      }
    }

    const handleGoogleLogin = async (response) => {
      
    }

    return {
      form,
      rules,
      loading,
      handleLogin,
      handleGoogleLogin
    }
  }
}
</script>
