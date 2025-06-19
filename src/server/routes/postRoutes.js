import express from 'express'
import authenticateToken from '../middleware/authenticateToken.js'
import Post from '../../models/Post.js'
import User from '../../models/User.js'
const router = express.Router()

// 🔹 Create a post
router.post('/', authenticateToken, async (req, res) => {
  try {
    const post = new Post({ ...req.body, author: req.user.id })
    await post.save()
    res.status(201).json({ message: 'Post created successfully', post })
  } catch (error) {
    console.error('Error creating post:', error)
    res.status(400).json({ message: 'Error creating post', error })
  }
})

// 🔹 Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
    res.json(posts)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error })
  }
})


// 🔹 Get all post
router.get('/:username', async (req, res) => {
  const user = await User.findOne({ username: req.params.username })
  try {
    const posts = await Post.find({ author: user.id })
    if (!posts) return res.status(404).json({ message: 'Posts not found' })
    res.json(posts)
  } catch (error) {
    console.error('Error fetching post:', error)
    res.status(500).json({ message: 'Error fetching post', error })
  }
})
// 🔹 Get a specific post
router.get('/:username/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })
    res.json(post)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching post', error })
  }
})

// 🔹 Update a post
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this post' })
    }

    Object.assign(post, req.body)
    await post.save()

    res.json({ message: 'Post updated successfully', post })
  } catch (error) {
    res.status(400).json({ message: 'Error updating post', error })
  }
})

// 🔹 Delete a post
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this post' })
    }

    await post.remove()
    res.json({ message: 'Post deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error })
  }
})

// 🔹 Add a comment
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    post.comments.push({ user: req.user.id, content: req.body.content })
    await post.save()

    res.status(201).json({ message: 'Comment added successfully', comments: post.comments })
  } catch (error) {
    res.status(400).json({ message: 'Error adding comment', error })
  }
})

export default router
