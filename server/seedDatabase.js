import mongoose from "mongoose"
import { faker } from "@faker-js/faker"
import bcrypt from "bcrypt"
import User from "./models/User.js"
import Post from "./models/Post.js"
import Notification from "./models/Notification.js"
import dotenv from "dotenv"

dotenv.config()

// Connect to MongoDB
const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URI)
		console.log("✅ MongoDB connected successfully")
	} catch (error) {
		console.error("❌ MongoDB connection failed:", error)
		process.exit(1)
	}
}

// Technology stacks for realistic project data
const techStacks = [
	["JavaScript", "React", "Node.js", "MongoDB"],
	["TypeScript", "Vue", "Express", "PostgreSQL"],
	["Python", "Django", "SQLite"],
	["Java", "Spring", "MySQL"],
	["PHP", "Laravel", "MySQL"],
	["C#", "ASP.NET", "SQL Server"],
	["JavaScript", "Next.js", "Firebase"],
	["Python", "Flask", "MongoDB"],
	["JavaScript", "Angular", "Node.js"],
	["TypeScript", "React", "GraphQL"],
	["Go", "Gin", "PostgreSQL"],
	["Rust", "Actix", "MongoDB"],
	["Swift", "iOS"],
	["Kotlin", "Android"],
	["Flutter", "Dart"],
	["React Native", "JavaScript"],
]

const projectTypes = [
	"Web Development",
	"Mobile App",
	"API Development",
	"Game",
	"Design",
	"Other",
]

// Generate realistic project content
const generateProjectContent = (title, description, tags) => {
	const sections = [
		`# ${title}`,
		`${description}`,
		"## Features",
		faker.lorem.paragraphs(2),
		"## Technologies Used",
		`This project was built using: ${tags.join(", ")}`,
		"## Installation",
		"```bash\nnpm install\nnpm start\n```",
		"## Usage",
		faker.lorem.paragraphs(1),
		"## Contributing",
		"Pull requests are welcome. For major changes, please open an issue first.",
		"## License",
		"MIT License",
	]
	return sections.join("\n\n")
}

// Generate realistic comments
const generateComments = () => {
	const commentTemplates = [
		"Great project! Really impressed with the implementation.",
		"Love the clean code structure. Well done!",
		"This is exactly what I was looking for. Thanks for sharing!",
		"Awesome work! How did you handle the authentication part?",
		"Really nice UI design. What framework did you use?",
		"This would be perfect for my current project. Mind if I fork it?",
		"Excellent documentation. Makes it easy to understand.",
		"I'm getting an error when I try to run this. Any suggestions?",
		"The responsive design is flawless. Great job!",
		"Could you add some unit tests to this project?",
	]

	return faker.helpers.arrayElement(commentTemplates)
}

// Clear existing data (DESTRUCTIVE - USE WITH CAUTION)
const clearDatabase = async () => {
	console.log("⚠️  WARNING: This will DELETE ALL existing data!")
	console.log("🧹 Clearing existing data...")
	await User.deleteMany({})
	await Post.deleteMany({})
	await Notification.deleteMany({})
	console.log("✅ Database cleared")
}

// Safe seeding - adds data without clearing existing data
const addSeedDataSafely = async () => {
	console.log("🌱 Adding seed data without clearing existing data...")

	const existingUsers = await User.find({})
	const existingPosts = await Post.find({})

	console.log(`📊 Current database state:`)
	console.log(`👥 Existing users: ${existingUsers.length}`)
	console.log(`📝 Existing posts: ${existingPosts.length}`)

	return { existingUsers, existingPosts }
}

// Create users
const createUsers = async (count = 20) => {
	console.log(`👥 Creating ${count} users...`)
	const users = []
	const hashedPassword = await bcrypt.hash("password123", 10)

	for (let i = 0; i < count; i++) {
		const firstName = faker.person.firstName()
		const lastName = faker.person.lastName()
		const username = faker.internet
			.username({ firstName, lastName })
			.toLowerCase()

		const user = new User({
			email: faker.internet.email({ firstName, lastName }).toLowerCase(),
			username: username,
			firstName: firstName,
			lastName: lastName,
			avatar: faker.image.avatar(),
			password: hashedPassword,
			bio: faker.lorem.sentence({ min: 5, max: 15 }),
			githubUrl: `https://github.com/${username}`,
			createdAt: faker.date.between({
				from: new Date("2023-01-01"),
				to: new Date(),
			}),
		})

		try {
			await user.save()
			users.push(user)
		} catch (error) {
			// Skip if username/email already exists
			console.log(`⚠️ Skipped user ${username} (duplicate)`)
		}
	}

	console.log(`✅ Created ${users.length} users`)
	return users
}

// Create followers relationships
const createFollowRelationships = async users => {
	console.log("🔗 Creating follow relationships...")

	for (const user of users) {
		// Each user follows 2-8 random other users
		const followCount = faker.number.int({ min: 2, max: 8 })
		const potentialFollows = users.filter(
			u => u._id.toString() !== user._id.toString()
		)
		const usersToFollow = faker.helpers.arrayElements(
			potentialFollows,
			followCount
		)

		for (const userToFollow of usersToFollow) {
			if (!user.following.includes(userToFollow._id)) {
				user.following.push(userToFollow._id)
				userToFollow.followers.push(user._id)
			}
		}

		await user.save()
	}

	// Save all users to update followers
	await Promise.all(users.map(user => user.save()))
	console.log("✅ Follow relationships created")
}

// Create posts
const createPosts = async (users, count = 50) => {
	console.log(`📝 Creating ${count} posts...`)
	const posts = []

	for (let i = 0; i < count; i++) {
		const author = faker.helpers.arrayElement(users)
		const techStack = faker.helpers.arrayElement(techStacks)
		const projectType = faker.helpers.arrayElement(projectTypes)

		const title = faker.helpers.arrayElement([
			`${techStack[0]} ${faker.hacker.noun().charAt(0).toUpperCase() + faker.hacker.noun().slice(1)}`,
			`${faker.company.buzzNoun()} ${faker.hacker.abbreviation()}`,
			`${faker.color.human()} ${faker.hacker.noun()}`,
			`${faker.hacker.adjective()} ${faker.hacker.noun()}`,
		])

		const description = faker.lorem.sentences({ min: 2, max: 4 })
		const content = generateProjectContent(title, description, techStack)

		const post = new Post({
			author: author._id,
			title: title,
			coverImage: faker.image.urlLoremFlickr({
				width: 800,
				height: 400,
				category: "technology",
			}),
			description: description,
			content: content,
			tags: techStack,
			githubUrl: `https://github.com/${author.username}/${title.toLowerCase().replace(/\s+/g, "-")}`,
			type: projectType,
			upvotes: faker.number.int({ min: 0, max: 50 }),
			downvotes: faker.number.int({ min: 0, max: 10 }),
			views: faker.number.int({ min: 10, max: 500 }),
			createdAt: faker.date.between({
				from: author.createdAt,
				to: new Date(),
			}),
		})

		await post.save()
		posts.push(post)
	}

	console.log(`✅ Created ${posts.length} posts`)
	return posts
}

// Create comments and replies
const createComments = async (posts, users) => {
	console.log("💬 Creating comments and replies...")

	for (const post of posts) {
		// Each post gets 2-8 comments
		const commentCount = faker.number.int({ min: 2, max: 8 })

		for (let i = 0; i < commentCount; i++) {
			const commenter = faker.helpers.arrayElement(users)
			const commentContent = generateComments()

			// Add mentions occasionally
			const shouldMention = faker.datatype.boolean({ probability: 0.3 })
			let finalContent = commentContent
			if (shouldMention) {
				const mentionedUser = faker.helpers.arrayElement(users)
				finalContent = `@${mentionedUser.username} ${commentContent}`
			}

			const comment = {
				user: commenter._id,
				content: finalContent,
				createdAt: faker.date.between({
					from: post.createdAt,
					to: new Date(),
				}),
				replies: [],
			}

			// Some comments get replies
			const shouldHaveReplies = faker.datatype.boolean({ probability: 0.4 })
			if (shouldHaveReplies) {
				const replyCount = faker.number.int({ min: 1, max: 3 })

				for (let j = 0; j < replyCount; j++) {
					const replier = faker.helpers.arrayElement(users)
					let replyContent = generateComments()

					// Replies often mention the original commenter
					const shouldMentionCommenter = faker.datatype.boolean({
						probability: 0.7,
					})
					if (shouldMentionCommenter) {
						const originalCommenter = users.find(
							u => u._id.toString() === commenter._id.toString()
						)
						replyContent = `@${originalCommenter.username} ${replyContent}`
					}

					comment.replies.push({
						user: replier._id,
						content: replyContent,
						createdAt: faker.date.between({
							from: comment.createdAt,
							to: new Date(),
						}),
					})
				}
			}

			post.comments.push(comment)
		}

		await post.save()
	}

	console.log("✅ Comments and replies created")
}

// Create notifications
const createNotifications = async (users, posts) => {
	console.log("🔔 Creating notifications...")
	const notifications = []

	// Create follow notifications
	for (const user of users) {
		for (const followerId of user.followers) {
			const follower = users.find(
				u => u._id.toString() === followerId.toString()
			)
			if (follower) {
				notifications.push({
					recipient: user._id,
					sender: follower._id,
					type: "follow",
					message: `${follower.firstName} ${follower.lastName} started following you`,
					createdAt: faker.date.between({
						from: follower.createdAt,
						to: new Date(),
					}),
					read: faker.datatype.boolean({ probability: 0.6 }),
				})
			}
		}
	}

	// Create post notifications (for followers)
	for (const post of posts) {
		const author = users.find(u => u._id.toString() === post.author.toString())
		if (author && author.followers.length > 0) {
			// Notify some followers about new posts
			const followersToNotify = faker.helpers.arrayElements(
				author.followers,
				Math.min(author.followers.length, faker.number.int({ min: 1, max: 5 }))
			)

			for (const followerId of followersToNotify) {
				notifications.push({
					recipient: followerId,
					sender: author._id,
					type: "follow",
					message: `${author.firstName} ${author.lastName} posted a new project: ${post.title}`,
					relatedPost: post._id,
					createdAt: faker.date.between({
						from: post.createdAt,
						to: new Date(),
					}),
					read: faker.datatype.boolean({ probability: 0.4 }),
				})
			}
		}
	}

	// Create comment notifications
	for (const post of posts) {
		const author = users.find(u => u._id.toString() === post.author.toString())

		for (const comment of post.comments) {
			const commenter = users.find(
				u => u._id.toString() === comment.user.toString()
			)

			// Notify post author of new comment (if not self-comment)
			if (
				commenter &&
				author &&
				comment.user.toString() !== post.author.toString()
			) {
				notifications.push({
					recipient: author._id,
					sender: commenter._id,
					type: "comment",
					message: `${commenter.firstName} ${commenter.lastName} commented on your project: ${post.title}`,
					relatedPost: post._id,
					relatedComment: comment._id,
					createdAt: comment.createdAt,
					read: faker.datatype.boolean({ probability: 0.5 }),
				})
			}

			// Create reply notifications
			for (const reply of comment.replies) {
				const replier = users.find(
					u => u._id.toString() === reply.user.toString()
				)

				// Notify original commenter of reply (if not self-reply)
				if (
					replier &&
					commenter &&
					reply.user.toString() !== comment.user.toString()
				) {
					notifications.push({
						recipient: comment.user,
						sender: replier._id,
						type: "comment",
						message: `${replier.firstName} ${replier.lastName} replied to your comment on: ${post.title}`,
						relatedPost: post._id,
						relatedComment: comment._id,
						createdAt: reply.createdAt,
						read: faker.datatype.boolean({ probability: 0.3 }),
					})
				}
			}
		}
	}

	// Insert notifications in batches
	if (notifications.length > 0) {
		await Notification.insertMany(notifications)
		console.log(`✅ Created ${notifications.length} notifications`)
	}
}

// Create user votes on posts
const createVotes = async (users, posts) => {
	console.log("👍 Creating user votes...")

	for (const user of users) {
		// Each user votes on 10-20 random posts
		const voteCount = faker.number.int({ min: 10, max: 20 })
		const postsToVote = faker.helpers.arrayElements(posts, voteCount)

		for (const post of postsToVote) {
			// Don't vote on own posts
			if (post.author.toString() === user._id.toString()) continue

			const voteType = faker.helpers.weightedArrayElement([
				{ weight: 70, value: true }, // 70% upvotes
				{ weight: 20, value: false }, // 20% downvotes
				{ weight: 10, value: null }, // 10% no vote
			])

			user.votedPosts.push({
				postId: post._id,
				upvoted: voteType,
			})
		}

		await user.save()
	}

	console.log("✅ User votes created")
}

// Randomize and update the "type" field for all posts
const randomizePostTypes = async () => {
	console.log("🎲 Randomizing 'type' field for all posts...")
	await connectDB()
	const posts = await Post.find({})
	if (!posts.length) {
		console.log("No posts found to update.")
		return
	}
	const updatedTypes = [
		"Web Development",
		"Mobile App",
		"API Development",
		"Game",
		"Design",
		"Data Science",
		"Machine Learning",
		"DevOps",
		"Other",
	]
	let updatedCount = 0
	for (const post of posts) {
		const randomType = faker.helpers.arrayElement(updatedTypes)
		post.type = randomType
		await post.save()
		updatedCount++
	}
	console.log(`✅ Updated 'type' for ${updatedCount} posts.`)
	mongoose.connection.close()
}

// Main seeding function
const seedDatabase = async (clearFirst = false) => {
	try {
		console.log("🌱 Starting database seeding...")

		await connectDB()

		if (clearFirst) {
			console.log("⚠️  DESTRUCTIVE MODE: Clearing existing data first!")
			await clearDatabase()
		} else {
			console.log("🔒 SAFE MODE: Preserving existing data")
			await addSeedDataSafely()
		}

		const users = await createUsers(25)
		await createFollowRelationships(users)

		const posts = await createPosts(users, 60)
		await createComments(posts, users)
		await createNotifications(users, posts)
		await createVotes(users, posts)

		console.log("🎉 Database seeding completed successfully!")
		console.log("\n📊 Summary:")
		console.log(`👥 Users: ${users.length}`)
		console.log(`📝 Posts: ${posts.length}`)
		console.log(
			`💬 Comments: ${posts.reduce((total, post) => total + post.comments.length, 0)}`
		)
		console.log(
			`↩️ Replies: ${posts.reduce(
				(total, post) =>
					total +
					post.comments.reduce(
						(replyTotal, comment) => replyTotal + comment.replies.length,
						0
					),
				0
			)}`
		)

		console.log("\n🔑 Test Credentials:")
		console.log("All users have password: password123")
		console.log(
			"Example usernames:",
			users
				.slice(0, 5)
				.map(u => u.username)
				.join(", ")
		)
	} catch (error) {
		console.error("❌ Seeding failed:", error)
	} finally {
		mongoose.connection.close()
	}
}

// Check command line arguments for destructive mode
const args = process.argv.slice(2)
const shouldClear = args.includes("--clear") || args.includes("--destructive")
const shouldRandomizeTypes = args.includes("--randomize-types")

if (shouldClear) {
	console.log("⚠️⚠️⚠️  DESTRUCTIVE MODE ENABLED ⚠️⚠️⚠️")
	console.log("This will DELETE ALL existing data!")
	console.log("Use 'npm run seed' for safe mode (preserves data)")
	console.log("Use 'npm run seed -- --clear' for destructive mode")
}

if (shouldRandomizeTypes) {
	randomizePostTypes()
} else {
	// Run the seeder
	seedDatabase(shouldClear)
}
