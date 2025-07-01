import axios from 'axios'

export function getAccessToken() {
  return sessionStorage.getItem('accessToken')
}

export async function fetchCurrentUser() {
  try {
    const res = await axios.get('https://server-codefolio.vercel.app/api/users/me', {
      headers: { Authorization: `Bearer ${getAccessToken()}` }
    })
    return res.data
  } catch (error) {
    console.error('Error fetching current user:', error)
    // throw error
  }
}

export async function fetchProfile(username) {
  try {
    const res = await axios.get(`https://server-codefolio.vercel.app/api/users/${username}`)
    return res.data
  } catch (error) {
    console.error(`Error fetching profile for user "${username}":`, error)
    // throw error
  }
}

export async function fetchProjects(username) {
  try {
    const res = await axios.get(`https://server-codefolio.vercel.app/api/posts/${username}`)
    console.log(`Fetched projects for user "${username}":`, res.data)
    return res.data
  } catch (error) {
    console.error(`Error fetching projects for user "${username}":`, error)
    // throw error
  }
}
