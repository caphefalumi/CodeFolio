// Composable for common API operations
import axios from 'axios'
import { ref, computed } from 'vue'

export function useApi() {
  const loading = ref(false)
  const error = ref('')
  const success = ref('')

  const getAuthHeaders = (token) => ({
    headers: { Authorization: `Bearer ${token}` }
  })

  const getAuthHeadersWithFormData = (token) => ({
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`
    }
  })

  const handleError = (err, defaultMessage = 'An error occurred') => {
    error.value = err.response?.data?.message || err.message || defaultMessage
  }

  const clearMessages = () => {
    error.value = ''
    success.value = ''
  }

  const apiCall = async (apiFunction, successMessage = '') => {
    loading.value = true
    clearMessages()
    
    try {
      const result = await apiFunction()
      if (successMessage) {
        success.value = successMessage
      }
      return result
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Common API operations
  const uploadImage = async (file, endpoint, token) => {
    const formData = new FormData()
    formData.append('image', file)
    
    const response = await axios.post(endpoint, formData, getAuthHeadersWithFormData(token))
    return response.data.uri
  }

  const createPost = async (payload, token) => {
    const response = await axios.post('https://server-codefolio.vercel.app/api/posts', payload, getAuthHeaders(token))
    return response.data.post
  }

  const updatePost = async (id, payload, token) => {
    const response = await axios.patch(`https://server-codefolio.vercel.app/api/posts/${id}`, payload, getAuthHeaders(token))
    return response.data.post
  }

  const deletePost = async (id, token) => {
    await axios.delete(`https://server-codefolio.vercel.app/api/posts/${id}`, getAuthHeaders(token))
  }

  const updateUser = async (payload, token) => {
    const response = await axios.patch('https://server-codefolio.vercel.app/api/users', payload, getAuthHeaders(token))
    return response.data
  }

  return {
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    success: computed(() => success.value),
    clearMessages,
    handleError,
    apiCall,
    getAuthHeaders,
    getAuthHeadersWithFormData,
    uploadImage,
    createPost,
    updatePost,
    deletePost,
    updateUser
  }
}

// Composable for form validation
export function useFormValidation() {
  const rules = {
    required: v => !!v || 'This field is required',
    email: v => /.+@.+\..+/.test(v) || 'Email must be valid',
    minLength: (min) => v => (v && v.length >= min) || `Must be at least ${min} characters`,
    maxLength: (max) => v => (!v || v.length <= max) || `Must be less than ${max} characters`,
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
    confirmPassword: (password) => v => v === password || 'Passwords must match',
    name: v => {
      if (!v) return 'This field is required'
      if (v.length < 2) return 'Name must be at least 2 characters'
      if (v.length > 50) return 'Name must be less than 50 characters'
      if (!/^[a-zA-Z\s'-]+$/.test(v)) return 'Name can only contain letters, spaces, hyphens, and apostrophes'
      return true
    }
  }

  const validateForm = (formData, validationRules) => {
    const errors = {}
    
    for (const [field, fieldRules] of Object.entries(validationRules)) {
      const value = formData[field]
      
      for (const rule of fieldRules) {
        const result = rule(value)
        if (result !== true) {
          errors[field] = result
          break
        }
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  return {
    rules,
    validateForm
  }
}

// Composable for loading states
export function useLoading() {
  const loadingStates = ref({})

  const setLoading = (key, value) => {
    loadingStates.value[key] = value
  }

  const isLoading = (key) => {
    return computed(() => loadingStates.value[key] || false)
  }

  const anyLoading = computed(() => {
    return Object.values(loadingStates.value).some(loading => loading)
  })

  return {
    setLoading,
    isLoading,
    anyLoading
  }
}
