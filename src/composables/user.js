import axios from 'axios'

export function getAccessToken() {
  return sessionStorage.getItem('accessToken')
}

export async function fetchCurrentUser() {
  try {
    const res = await axios.get('/api/users/me', {
      headers: { Authorization: `Bearer ${getAccessToken()}` }
    })
    return res.data
  } catch (error) {
    console.error('Error fetching current user:', error)
    throw error
  }
}

export async function fetchProfile(username) {
  try {
    const res = await axios.get(`/api/users/${username}`, {
      headers: { Authorization: `Bearer ${getAccessToken()}` }
    })
    return res.data
  } catch (error) {
    console.error(`Error fetching profile for user "${username}":`, error)
    throw error
  }
}

export async function fetchProjects(username) {
  try {
    const res = await axios.get(`/api/posts/${username}`, {
      headers: { Authorization: `Bearer ${getAccessToken()}` }
    })
    console.log(`Fetched projects for user "${username}":`, res.data)
    return res.data
  } catch (error) {
    console.error(`Error fetching projects for user "${username}":`, error)
    throw error
  }
}
