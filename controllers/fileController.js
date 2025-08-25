import File from '../models/File.js';
import { sendDownloadLinkEmail } from '../utils/emailService.js';
import crypto from 'crypto';

// Generate unique download ID
const generateDownloadId = () => {
  return crypto.randomBytes(16).toString('hex');
};

// Upload file
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Calculate expiry time (1 hour from now)
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + 1);

    // Generate unique download ID
    const downloadId = generateDownloadId();

    // Create file record
    const file = await File.create({
      filename: req.file.originalname,
      fileURL: req.file.path,
      uploadedBy: req.user._id,
      expiryTime,
      downloadId,
    });

    // Generate download link
    const downloadLink = `${req.protocol}://${req.get('host')}/api/files/download/${downloadId}`;

    // Send email with download link
    try {
      await sendDownloadLinkEmail(req.user.email, req.file.originalname, downloadLink);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue even if email fails
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

// Download file
const downloadFile = async (req, res) => {
  try {
    const { id } = req.params;

    // Find file by download ID
    const file = await File.findOne({ downloadId: id }).populate('uploadedBy', 'name email');

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if file has expired
    if (new Date() > file.expiryTime) {
      return res.status(410).json({ message: 'Download link has expired' });
    }

    // Increment download count
    file.downloadCount += 1;
    await file.save();

    // Redirect to the file URL
    res.redirect(file.fileURL);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's files
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

export { uploadFile, downloadFile, getUserFiles };