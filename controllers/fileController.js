import File from '../models/File.js';
import { cloudinary } from '../config/cloudinary.js';
import { sendDownloadLinkEmail } from '../utils/emailService.js';
import crypto from 'crypto';


const generateDownloadId = () => {
  return crypto.randomBytes(16).toString('hex');
};


const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + 1);

    
    const downloadId = generateDownloadId();

    
    const file = await File.create({
      filename: req.file.originalname,
      fileURL: req.file.path,
      uploadedBy: req.user._id,
      expiryTime,
      downloadId,
    });

    
    const downloadLink = `${req.protocol}://${req.get('host')}/api/files/download/${downloadId}`;

    
    try {
      await sendDownloadLinkEmail(req.user.email, req.file.originalname, downloadLink);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      
    }

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        id: file._id,
        filename: file.filename,
        downloadLink,
        expiryTime: file.expiryTime,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
};


const downloadFile = async (req, res) => {
  try {
    const { id } = req.params;

    
    const file = await File.findOne({ downloadId: id }).populate('uploadedBy', 'name email');

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    
    if (new Date() > file.expiryTime) {
      return res.status(410).json({ message: 'Download link has expired' });
    }

    
    file.downloadCount += 1;
    await file.save();

    
    res.redirect(file.fileURL);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getUserFiles = async (req, res) => {
  try {
    const files = await File.find({ uploadedBy: req.user._id })
      .sort({ createdAt: -1 })
      .select('filename downloadCount expiryTime createdAt');

    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadFile,
  downloadFile,
  getUserFiles,
};