import express from 'express'
import bcrypt from 'bcrypt'
import 'dotenv/config'
import User from '../../models/User.js'
const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const users = await User.find()
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error })
  }
})

router.get('/:id', async (req, res) => {
  const userId = req.params.id
  try {
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error })
  }
})

router.post('/register', async (req, res) => {
  const saltRounds = 10
  const hashedPassword = await bcrypt.hash(req.body.password, saltRounds)
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword,
    fullName: req.body.fullName,
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



router.patch('/', async (req, res) => {
  const updatedUser = req.body
  // Here you would typically update the user in the database
  res.json({ message: 'User updated successfully', user: updatedUser })
})


router.delete('/:id', async (req, res) => {
  const userId = req.params.id
  try {
    await User.findByIdAndDelete(userId)
    res.json({ message: `User with ID: ${userId} deleted successfully` })
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error })
  }
})

export default router