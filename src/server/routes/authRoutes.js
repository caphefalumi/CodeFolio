import express from 'express'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import 'dotenv/config'
import User from '../../models/User.js'
import axios from 'axios'
const router = express.Router()
import getRandomCat from 'random-cat-img'


router.post('/token', async (req, res) => {
    const refreshToken = req.headers.cookie
    if (!refreshToken) {
        return res.sendStatus(401)
    }
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err) => {
    if (err) {
      console.error('Invalid refresh token:', err)
      return res.sendStatus(403)
    }
    const user = User.findOne({ refreshToken: refreshToken })
    if (!user) {
      console.error('User not found for refresh token:', refreshToken)
      return res.sendStatus(403)

    }

    const newRefreshToken = jwt.sign({ user }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
    user.refreshToken = newRefreshToken
    user.save()
    res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        origin: 'http://localhost:3000',
    })

    const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
    res.json({ accessToken })
    })
})

router.post('/register', async (req, res) => {
  const saltRounds = 10
  const hashedPassword = await bcrypt.hash(req.body.password, saltRounds)
  const user = new User({
    email: req.body.email,
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    password: hashedPassword,
    avatar: await getRandomCat().then(data => data.message),
    bio: req.body.bio,
    location: req.body.location,
    githubUrl: req.body.githubUrl,
    avatarUrl: req.body.avatarUrl
  })
  try {
    if (!user.username || !user.email || !user.password) {
      return res.status(400).json({ message: 'Username, email, and password are required' })
    } else if (await User.findOne({ username: user.username })) {
      return res.status(400).json({ message: 'Username already exists' })
    } else if (await User.findOne({ email: user.email })) {
      return res.status(400).json({ message: 'Email already exists' })
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error creating user', error })
  }
  // Here you would typically save the new user to the database
  user.save()
  res.status(201).json({ message: 'User created successfully', user: user })
})


router.post('/login/jwt', async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' })

    user.refreshToken = refreshToken
    await user.save()
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      origin: 'http://localhost:3000',
    })
    res.status(200).json({ accessToken, refreshToken })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error', error: err })
  }
})



router.post('/login/google', async (req, res) => {
  const googleAccessToken = req.body.token

  if (!googleAccessToken) {
    return res.status(400).json({ message: 'No access token provided' })
  }

  try {
    // 1. Get user info from Google
    const { data: googleUser } = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${googleAccessToken}`,
      },
    })

    const { id: id, email: email, picture: picture } = googleUser
    console.log('Google User Info:', googleUser)
    let user = await User.findOne({ email })

    if (!user) {
      user = new User({
        username: email.split('@')[0] + crypto.randomBytes(5).toString('hex'),
        email: email,
        firstName: googleUser.given_name,
        lastName: googleUser.family_name,
        password: crypto.randomBytes(128).toString('hex'),
        avatar: picture,
        oAuthProviders: [{ provider: 'google', providerId: id }],
      })
    } else {
      const hasGoogle = user.oAuthProviders.find(p => p.provider === 'google' && p.providerId === id)
      if (!hasGoogle) {
        user.oAuthProviders.push({ provider: 'google', providerId: id })
      }
    }


    // 4. Generate refresh and access tokens
    const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' })

    // 5. Save refresh token to DB and send in cookie
    user.refreshToken = refreshToken
    await user.save()

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      origin: 'http://localhost:3000',
    })

    // 6. Send access token to client
    res.json({ accessToken })

  } catch (err) {
    console.error('Google login failed:', err)
    res.status(500).json({ message: 'Google login failed', error: err.message || err })
  }
})

router.get('/login/github', async (req, res) => {
  res.redirect(`https://github.com/login/oauth/authorize?scope=user:email&client_id=${process.env.GITHUB_CLIENT_ID}&scope=user`)
})

router.get('/login/github/callback', async (req, res) => {
  const code = req.query.code
  try {
    // Exchange code for access token
    const resp = await axios.post(
      `https://github.com/login/oauth/access_token`,
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: { accept: 'application/json' },
      }
    )

    const access_token = resp.data.access_token
    console.log('GitHub Access Token:', access_token)

    // 1. Get user profile info
    const { data: userProfile } = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${access_token}` },
    })

    const avatar_url = userProfile.avatar_url

    // 2. Get user email info
    const { data: emails } = await axios.get('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${access_token}` },
    })

    // 3. Extract primary verified email
    const primaryEmailObj = emails.find(email => email.primary && email.verified)
    if (!primaryEmailObj) {
      return res.status(400).json({ message: 'No verified primary email found in GitHub account' })
    }

    const email = primaryEmailObj.email

    // 4. Find or create user
    let user = await User.findOne({ email })
    if (!user) {
      user = new User({
        username: email.split('@')[0] + crypto.randomBytes(5).toString('hex'),
        email,
        password: crypto.randomBytes(128).toString('hex'), // Dummy password
        oAuthProviders: [{
          provider: 'github',
          providerId: userProfile.id,
        }],
        avatar: avatar_url,
      })
    } else {
      const hasGithub = user.oAuthProviders.find(p => p.provider === 'github' && p.providerId === userProfile.id)
      if (!hasGithub) {
        user.oAuthProviders.push({ provider: 'github', providerId: userProfile.id })
      }
    }

    // 5. Generate and save tokens
    const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
    console.log('Generated Access Token:', accessToken)
    user.refreshToken = refreshToken
    await user.save()

    // 6. Send cookie and token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      origin: 'http://localhost:3000',
    })
    res.send(`
      <script>
        window.opener.postMessage(
          ${JSON.stringify({ accessToken})},
          "http://localhost:3000"
        );
        window.close();
      </script>
    `)

  } catch (err) {
    console.error('GitHub login failed:', err)
    res.status(500).json({ message: 'GitHub login failed', error: err.message || err })
  }
})
  


router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body
  if (!refreshToken) {
    return res.sendStatus(204)
  }
  try {
    const user = await User.findOne({ refreshToken: refreshToken })
    if (!user) {
      return res.sendStatus(204)
    }
    user.refreshToken = null
    await user.save()
    res.sendStatus(204)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error', error: err })
  }
})



export default router