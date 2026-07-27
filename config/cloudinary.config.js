const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'beautiful souls',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'],
    public_id: (req, file) =>
      `${file.originalname.split('.')[0]}-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
  },
});

const uploadCloud = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, 
});

module.exports = uploadCloud;