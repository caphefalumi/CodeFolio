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
	following: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	],
	followers: [
		{
			type: mongoose.Schema.Types.ObjectId,
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

userSchema.statics.findByUsername = function (username) {
	return this.findOne({ username: username })
}

userSchema.virtual("name").get(function () {
	return this.firstName + " " + this.lastName
})

userSchema.virtual("followersCount").get(function () {
	return this.followers ? this.followers.length : 0
})

userSchema.virtual("followingCount").get(function () {
	return this.following ? this.following.length : 0
})

// Enable virtual fields in JSON
userSchema.set("toJSON", {
	virtuals: true,
	transform: (_, ret) => {
		delete ret.password
		delete ret.__v
		delete ret.refreshToken
		delete ret.resetCode
		delete ret.resetCodeExpires
		return ret
	},
})

userSchema.pre("save", function (next) {
	this.updatedAt = Date.now()
	next()
})
userSchema.pre("findOneAndUpdate", function (next) {
	this.set({ updatedAt: Date.now() })
	next()
})

// Cascade deletion when user is deleted
userSchema.pre("findOneAndDelete", async function (next) {
	try {
		const userId = this.getQuery()._id

		// Import models here to avoid circular dependency
		const Post = (await import("./Post.js")).default
		const Notification = (await import("./Notification.js")).default

		// Delete all posts by this user
		await Post.deleteMany({ author: userId })
		// Remove user's comments and replies from all posts (separate operations to avoid conflicts)
		// First remove replies
		await Post.updateMany(
			{},
			{
				$pull: {
					"comments.$[].replies": { user: userId },
				},
			}
		)

		// Then remove comments
		await Post.updateMany(
			{},
			{
				$pull: {
					comments: { user: userId },
				},
			}
		)

		// Delete all notifications
		await Notification.deleteMany({
			$or: [{ sender: userId }, { recipient: userId }],
		})

		await this.model.updateMany(
			{ following: userId },
			{ $pull: { following: userId } }
		)
		await this.model.updateMany(
			{ followers: userId },
			{ $pull: { followers: userId } }
		)
		const userPosts = await Post.find({ author: userId }).distinct("_id")
		await this.model.updateMany(
			{},
			{ $pull: { votedPosts: { postId: { $in: userPosts } } } }
		)

		next()
	} catch (error) {
		next(error)
	}
})

const User = mongoose.model("User", userSchema)

export default User
