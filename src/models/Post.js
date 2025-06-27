import mongoose from 'mongoose'
import User from './User.js'
const replySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
}, { _id: false })

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    replies: [replySchema]
})

const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true,
    },
    coverImage: {
        type: String,
    },
    description: {
        type: String,
    },
    content: {
        type: String,
        required: true
    },
    tags: {
        type: [String],
        default: []
    },
    githubUrl: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['web', 'mobile', 'game', 'design'],
        default: 'web',
        required: true
    },
    upvotes: {
        type: Number,
        default: 0
    },
    downvotes: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    comments: [commentSchema]
})

postSchema.statics.findByAuthor = async function(username) {
  const user = await User.findOne({ username: new RegExp(username, 'i') })
  if (!user) return []
  return this.find({ author: user._id }).populate('author', 'username')
}


postSchema.virtual('getAuthor').get(async function() {
  return User.findById(this.author).select('username')
})
postSchema.virtual('getFullPath').get(function () {
  console.log('Author:', this.author) // check this
  if (!this.author || !this.author.username) return null
  return `${this.author.username}/${this._id}`
})

postSchema.set('toJSON', { virtuals: true })

const Post = mongoose.model("Post", postSchema)
export default Post
