import mongoose from "mongoose"

const votedPostsSchema = new mongoose.Schema({
	postId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Post",
	},
	upvoted: {
		type: Boolean,
		default: null,
	},
})

const oAuthProviderSchema = new mongoose.Schema(
	{
		provider: {
			type: String,
			enum: ["google", "github"],
			required: true,
		},
		providerId: {
			type: String,
			required: true,
		},
	},
	{ _id: false }
)

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true,
	},
	username: {
		type: String,
		required: true,
		unique: true,
	},
	firstName: {
		type: String,
		required: true,
	},
	lastName: {
		type: String,
		required: true,
	},
	avatar: {
		type: String,
	},
	password: {
		type: String,
	},
	oAuthProviders: {
		type: [oAuthProviderSchema],
		default: [],
	},
	bio: {
		type: String,
		default: "",
	},
	githubUrl: {
		type: String,
		default: "",
	},
	followed: [
		{
			type: String,
			ref: "User",
		},
	],

	followers: [
		{
			type: String,
			ref: "User",
		},
	],
	votedPosts: [votedPostsSchema],
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
	refreshToken: {
		type: String,
		default: null,
	},
	resetCode: {
		type: String,
	},
	resetCodeExpires: {
		type: Date,
	},
})

userSchema.set("toJSON", {
	transform: (_, ret) => {
		delete ret.password
		delete ret.__v
		return ret
	},
})

userSchema.statics.findByUsername = function (username) {
	return this.findOne({ username: username })
}

userSchema.virtual("name").get(function () {
	return this.firstName + " " + this.lastName
})

userSchema.pre("save", function (next) {
	this.updatedAt = Date.now()
	next()
})
userSchema.pre("findOneAndUpdate", function (next) {
	this.set({ updatedAt: Date.now() })
	next()
})

const User = mongoose.model("User", userSchema)

export default User
