import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import 'dotenv/config'
import User from '../../models/User.js'
const router = express.Router()


router.post('/token', async (req, res) => {
  const { refreshToken } = req.body
  if (!refreshToken) {
    return res.sendStatus(401)
  }
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403)
    }
    const user = User.findOne({ refreshToken: refreshToken })
    if (!user) {
      return res.sendStatus(403)
    }
    const accessToken = jwt.sign({ email: user.email, username: user.username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
    res.json({ accessToken })
  })
})



router.post('/login/jwt', async (req, res) => {
  const { email, password } = req.body
  const username = req.body.username
  const accessToken = jwt.sign({ email: email, username: username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
  const refreshToken = jwt.sign({ email: email, username: username }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    user.refreshToken = refreshToken
    await user.save()
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000
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

export default router