import express from 'express'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import 'dotenv/config'
import User from '../../models/User.js'
import axios from 'axios'
const router = express.Router()


router.post('/token', async (req, res) => {
    const refreshToken = req.headers.cookie
    if (!refreshToken) {
        return res.sendStatus(401)
    }
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err) => {
    if (err) {
        return res.sendStatus(403)
    }
    const user = User.findOne({ refreshToken: refreshToken })
    if (!user) {
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
    const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '12h' })
    const refreshToken = jwt.sign({ user }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' })

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

    const { email, picture, name } = googleUser

    // 2. Check if user already exists
    let user = await User.findOne({ email })

    // 3. If not, create a new user
    if (!user) {
      user = new User({
        username: email.split('@')[0] + crypto.randomBytes(5).toString('hex'),
        email,
        password: crypto.randomBytes(128).toString('hex'), // Dummy password
        oAuthProvider: 'google',
        profilePicture: picture,
        name,
      })
    }

    // 4. Generate refresh and access tokens
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
    const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })

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