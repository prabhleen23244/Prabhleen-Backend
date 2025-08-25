import express from 'express';
import { uploadFile, downloadFile, getUserFiles } from '../controllers/fileController.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/upload', auth, upload.single('file'), uploadFile);
router.get('/download/:id', downloadFile);
router.get('/my-files', auth, getUserFiles);

export default router;