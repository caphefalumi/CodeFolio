import axios from 'axios'

export function getAccessToken() {
  return sessionStorage.getItem('accessToken')
}

export async function fetchUserProfile() {
  const res = await axios.get('/api/users/me', {
    headers: { Authorization: `Bearer ${getAccessToken()}` }
  })
  return res.data
}

export async function fetchUserProjects() {
  const res = await axios.get('/api/posts/me', {
    headers: { Authorization: `Bearer ${getAccessToken()}` }
  })
  return res.data
}
