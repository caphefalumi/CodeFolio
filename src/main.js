import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router/router.js'
import vue3GoogleLogin from 'vue3-google-login'
// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
const availableThemes = ['light', 'dark']
const savedTheme = localStorage.getItem('theme')
const defaultTheme = availableThemes.includes(savedTheme) ? savedTheme : 'light'

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme,
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#4CAF50',
          secondary: '#81C784',
          accent: '#2E7D32',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',
          background: '#F5F5F5',
          surface: '#FFFFFF',
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#81C784',
          secondary: '#4CAF50',
          accent: '#A5D6A7',
          error: '#EF9A9A',
          info: '#90CAF9',
          success: '#A5D6A7',
          warning: '#FFE082',
          background: '#121212',
          surface: '#1E1E1E',
        },
      },
    },
  },
})

const app = createApp(App)
app.use(router)
app.use(vuetify)

app.use(vue3GoogleLogin, {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  prompt: true,
  autoLogin: true
})

app.mount('#app')
