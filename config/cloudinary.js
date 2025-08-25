import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'prabhleen-backend-app',
        format: async (req, file) => {
            const ext = file.originalname.split('.').pop();
      return ext;
    },
    public_id: (req, file) => {
      
      const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      return filename;
    },
  },
});

module.exports = {
  cloudinary,
  storage
};
            


