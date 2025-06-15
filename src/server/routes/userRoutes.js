import express from 'express'
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

router.get('/:username', async (req, res) => {
  const username = req.params.username
  try {
    const user = await User.findOne({ username })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error })
  }
})

router.post('/', (req, res) => {
  const saltRounds = 10
  const hashedPassword = bcrypt.hash(req.body.password, saltRounds)
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
    } 
    else {
      user.save()
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error creating user', error })
  }
  // Here you would typically save the new user to the database
  res.status(201).json({ message: 'User created successfully', user: user })
})
router.patch('/', (req, res) => {
  const updatedUser = req.body
  // Here you would typically update the user in the database
  res.json({ message: 'User updated successfully', user: updatedUser })
})
router.delete('/:id', (req, res) => {
  const userId = req.params.id
  // Here you would typically delete the user from the database
  res.json({ message: `User with ID: ${userId} deleted successfully` })
})

export default router;