import mongoose from "mongoose"
import "dotenv/config"

// Import your models to ensure they're registered
import "./models/User.js"
import "./models/Post.js"

async function testCollections() {
	try {
		// Connect to MongoDB
		await mongoose.connect(process.env.MONGODB_URI)
		console.log(`✅ Connected to MongoDB: ${process.env.MONGODB_URI}`)

		// Get the native MongoDB connection
		const db = mongoose.connection.db

		// List all collections
		const collections = await db.listCollections().toArray()
		console.log("\n📋 Available Collections:")
		console.log("========================")

		if (collections.length === 0) {
			console.log("No collections found in the database.")
			return
		}

		// Print collection names
		collections.forEach((collection, index) => {
			console.log(`${index + 1}. ${collection.name}`)
		})

		console.log("\n📊 Collection Data:")
		console.log("===================")

		// For each collection, print some sample data
		for (const collection of collections) {
			const collectionName = collection.name
			console.log(`\n--- ${collectionName.toUpperCase()} ---`)

			try {
				// Get document count
				const count = await db.collection(collectionName).countDocuments()
				console.log(`Total documents: ${count}`)

				if (count > 0) {
					// Get first 5 documents as sample
					const sampleDocs = await db
						.collection(collectionName)
						.find({})
						.limit(5)
						.toArray()

					console.log("Sample documents:")
					sampleDocs.forEach((doc, index) => {
						console.log(`  ${index + 1}.`, JSON.stringify(doc, null, 2))
					})

					if (count > 5) {
						console.log(`  ... and ${count - 5} more documents`)
					}
				} else {
					console.log("Collection is empty")
				}
			} catch (error) {
				console.error(
					`Error reading collection ${collectionName}:`,
					error.message
				)
			}
		}
	} catch (error) {
		console.error("❌ Error:", error.message)
	} finally {
		// Close the connection
		await mongoose.connection.close()
		console.log("\n🔌 Database connection closed")
		process.exit(0)
	}
}

// Alternative function to get all data from specific models
async function testModels() {
	try {
		await mongoose.connect(process.env.MONGODB_URI)
		console.log("✅ Connected to MongoDB using Mongoose models")

		// Test Users collection
		console.log("\n👥 USERS:")
		console.log("=========")
		const User = mongoose.model("User")
		const users = await User.find({}).limit(10)
		console.log(`Found ${users.length} users:`)
		users.forEach((user, index) => {
			console.log(
				`${index + 1}. ${user.username} (${user.email}) - Created: ${user.createdAt}`
			)
		})

		// Test Posts collection
		console.log("\n📝 POSTS:")
		console.log("=========")
		const Post = mongoose.model("Post")
		const posts = await Post.find({}).populate("author", "username").limit(10)
		console.log(`Found ${posts.length} posts:`)
		posts.forEach((post, index) => {
			console.log(
				`${index + 1}. "${post.title}" by ${post.author?.username || "Unknown"} - Created: ${post.createdAt}`
			)
		})
	} catch (error) {
		console.error("❌ Error:", error.message)
	} finally {
		await mongoose.connection.close()
		console.log("\n🔌 Database connection closed")
		process.exit(0)
	}
}

// Run the test
console.log("🔍 MongoDB Collections Test")
console.log("============================")

// Uncomment the function you want to run:
testCollections() // Shows raw collections and documents
// testModels()     // Shows data using your Mongoose models
