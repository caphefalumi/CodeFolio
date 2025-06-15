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

// 🔸 Update a post
router.patch('/:id', async (req, res) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true })
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

export default router
