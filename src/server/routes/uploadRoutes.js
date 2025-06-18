import express from 'express'
import multer from 'multer'
import image2uri from 'image2uri'
const router = express.Router()
const upload = multer({ dest: 'uploads/' })

router.post('/image', upload.single('image'), async (req, res) => {
  try {
    const mimeToExt = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/svg+xml': '.svg',
    'image/bmp': '.bmp',
    'image/x-icon': '.ico'
    }

    const ext = mimeToExt[req.file.mimetype]

    const filePath = req.file.path
    const dataUri = await image2uri(filePath, { ext: ext})


    // Send URI back to frontend
    res.json({ uri: dataUri })
  } catch (err) {
    console.error('Image conversion failed:', err)
    res.status(400).json({ message: 'Failed to convert image' })
  }
})

export default router
