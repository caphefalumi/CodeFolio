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
}, { _id: false })

const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true,
        unique: true
    },
    coverImage: {
        type: String,
        required: true
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

postSchema.static.findByAuthor = function(username) {
    user = User.findOne({ username: new RegExp(username, 'i') })
    return this.find({ author: user._id }).populate('author', 'username avatar')
}
postSchema.static.getAuthor = function(id) {
    post = this.findById(id)
    return User.findOne({ _id: post.author }).select('username avatar')
}
postSchema.static.getFullPath = function(id) {
    return `${process.env.BASE_URL}/${Post.getAuthor(id).username}/${id}`
}

const Post = mongoose.model("Post", postSchema)
export default Post
