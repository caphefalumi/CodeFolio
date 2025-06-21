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
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
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
  followed: [{
    type: String,
    ref: "User",
  }],

  followers: [{
    type: String,
    ref: "User",
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  refreshToken: {
    type: String,
    default: null
  },
})

userSchema.set('toJSON', {
  transform: (_, ret) => {
    delete ret.password
    delete ret.avatar
    return ret
  }
})

userSchema.static.findByUsername = function(username) {
  return this.findOne({ username: new RegExp(username, 'i') })
}

userSchema.virtual('name').get(function() {
  return this.firstName + ' ' + this.lastName
})

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  next()
})
userSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() })
  next()
})

const User = mongoose.model("User", userSchema)
export default User
