import express from "express"
import multer from "multer"
import sharp from "sharp"

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

router.post("/image/:type", upload.single("image"), async (req, res) => {
	try {
		const file = req.file
		const { type } = req.params

		if (!file || (type !== "profile" && type !== "blog")) {
			return res
				.status(400)
				.json({ message: "Invalid upload type or missing image" })
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

		res.json({ uri: dataUri })
	} catch (err) {
		console.error("Image processing failed:", err)
		res.status(500).json({ message: "Failed to process image" })
	}
})

export default router
