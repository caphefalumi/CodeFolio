import express from "express"
import multer from "multer"
import sharp from "sharp"
import fetch from "node-fetch"

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

// Image processing function
async function processImageUpload(file, type) {
	if (!file || (type !== "profile" && type !== "blog")) {
		throw new Error("Invalid upload type or missing image")
	}

	// Set dimensions based on image type
	const resizeOptions = {
		profile: { width: 512, height: 512 },
		blog: { width: 1280, height: 720 }, // maintains aspect ratio
	}

	const { width, height } = resizeOptions[type]

	const compressedBuffer = await sharp(file.buffer)
		.resize({
			width,
			height,
			fit: "cover",
			position: "center",
		})
		.jpeg({ quality: 75, mozjpeg: true })
		.toBuffer()

	const base64 = compressedBuffer.toString("base64")
	const dataUri = `data:image/jpeg;base64,${base64}`

	return dataUri
}

// Convert image URL to data URI
async function convertImageUrlToUri(imageUrl, type) {
	if (!imageUrl) {
		throw new Error("Image URL is required")
	}

	if (type && type !== "profile" && type !== "blog") {
		throw new Error("Invalid image type")
	}

	try {
		// Fetch the image from the URL
		const response = await fetch(imageUrl)

		if (!response.ok) {
			throw new Error(
				`Failed to fetch image: ${response.status} ${response.statusText}`
			)
		}

		// Check if the response is actually an image
		const contentType = response.headers.get("content-type")
		if (!contentType || !contentType.startsWith("image/")) {
			throw new Error("URL does not point to an image")
		}

		// Get the image buffer
		const imageBuffer = await response.arrayBuffer()

		// If type is specified, resize and compress the image
		if (type) {
			const resizeOptions = {
				profile: { width: 512, height: 512 },
				blog: { width: 1280, height: 720 },
			}

			const { width, height } = resizeOptions[type]

			const compressedBuffer = await sharp(imageBuffer)
				.resize({
					width,
					height,
					fit: "cover",
					position: "center",
				})
				.jpeg({ quality: 75, mozjpeg: true })
				.toBuffer()

			const base64 = compressedBuffer.toString("base64")
			return `data:image/jpeg;base64,${base64}`
		} else {
			// Just convert to base64 without resizing
			const base64 = imageBuffer.toString("base64")
			const mimeType = contentType || "image/jpeg"
			return `data:${mimeType};base64,${base64}`
		}
	} catch (error) {
		return imageUrl
	}
}

export { convertImageUrlToUri }
router.post("/image/:type", upload.single("image"), async (req, res) => {
	try {
		const file = req.file
		const { type } = req.params

		const dataUri = await processImageUpload(file, type)
		res.json({ uri: dataUri })
	} catch (err) {
		console.error("Image processing failed:", err)

		// Handle specific error messages
		if (err.message === "Invalid upload type or missing image") {
			return res.status(400).json({ message: err.message })
		}

		res.status(500).json({ message: "Failed to process image" })
	}
})

export default router
