import express from 'express'
import authenticateToken from '../middleware/authenticateToken.js'
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
router.get('/me', authenticateToken, async (req, res) => {

  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching current user', error })
  }
})

router.get('/:id', async (req, res) => {
  const userId = req.params.id
  try {
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json(user.toObject({ getters: true }))
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error })
  }
})



router.patch('/', authenticateToken, async (req, res) => {
  const updatedUser = req.body
  try {
    await User.findByIdAndUpdate(req.user.id, updatedUser, { new: true })
    res.json({ message: 'User updated successfully', user: updatedUser })
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(400).json({ message: 'Error updating user', error })
  }
})


router.delete('/', authenticateToken, async (req, res) => {
  const userId = req.user.id
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' })
  }
  try {
    await User.findByIdAndDelete(userId)
    res.json({ message: `User with ID: ${userId} deleted successfully` })
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error })
  }
})




export default router