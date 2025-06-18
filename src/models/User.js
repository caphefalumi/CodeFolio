import mongoose from 'mongoose'
import getRandomCat from 'random-cat-img'
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: getRandomCat()
    },
    oAuthProvider: {
        type: String,
        enum: ["google", "github", "none"],
        default: "none"
    },
    bio: {
        type: String,
        default: ""
    },
    githubUrl: {    
        type: String,
        default: ""
    },
    refreshToken: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
})

userSchema.set('toJSON', {
  transform: (_, ret) => {
    delete ret.password
    return ret
  }
})

const User = mongoose.model("User", userSchema)
export default User
