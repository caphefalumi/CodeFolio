import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import 'dotenv/config'
import User from '../../models/User.js'
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

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' })

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' })
    req.user = user
    next()
  })
  next()
}

export default router