import mongoose from 'mongoose'

const oAuthProviderSchema = new mongoose.Schema({
  provider: {
    type: String,
    enum: ['google', 'github'],
    required: true,
  },
  providerId: {
    type: String,
    required: true,
  }
}, { _id: false })

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
  },
  oAuthProviders: {
    type: [oAuthProviderSchema],
    default: []
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
  }
})

userSchema.set('toJSON', {
  transform: (_, ret) => {
    delete ret.password
    return ret
  }
})

const User = mongoose.model("User", userSchema)
export default User
