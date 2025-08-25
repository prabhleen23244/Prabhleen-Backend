import multer from 'multer';
import { storage } from '../config/cloudinary.js';

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    
    cb(null, true);
  }
});

module.exports = upload;