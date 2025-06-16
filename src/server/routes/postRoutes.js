import express from 'express'
import Post from '../../models/Post.js'

const router = express.Router()

// 🔸 Create a new post
router.post('/', async (req, res) => {
  try {
    const newPost = await Post.create(req.body)
    newPost.save()
    res.status(201).json({ message: 'Post created successfully', post: newPost })
  } catch (error) {
    res.status(400).json({ message: 'Error creating post', error })
  }
})

// 🔸 Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
    res.json(posts)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error })
  }
})

// 🔸 Get a single post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })
    res.json(post)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching post', error })
  }
})

router.get('/:username/', async (req, res) => {
  try {
    const posts = await Post.find({ username: req.params.username })
    if (!posts) return res.status(404).json({ message: 'No posts found' })
    res.json(posts)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching post', error })
  }
})

// 🔸 Update a post
router.patch('/:username/:id', async (req, res) => {
  try {
    const updatedPost = await Post.findOneAndUpdate(
      { _id: req.params.id, username: req.params.username },
      req.body,
      { new: true }
    )
    if (!updatedPost) return res.status(404).json({ message: 'Post not found' })
    res.json({ message: 'Post updated successfully', post: updatedPost })
  } catch (error) {
    res.status(400).json({ message: 'Error updating post', error })
  }
})

// 🔸 Delete a post
router.delete('/:id', async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id)
    if (!deletedPost) return res.status(404).json({ message: 'Post not found' })
    res.json({ message: 'Post deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error })
  }
})

// 🔸 Add a comment to a post
router.post('/:id/comments', async (req, res) => {
  const { user, content } = req.body
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    post.comments.push({ user, content })
    await post.save()
    res.status(201).json({ message: 'Comment added successfully', comments: post.comments })
  } catch (error) {
    res.status(400).json({ message: 'Error adding comment', error })
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
  next() // For simplicity, skipping actual token verification in this example
}

export default router
