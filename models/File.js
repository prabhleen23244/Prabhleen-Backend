import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
    trim: true
  },
  fileURL: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiryTime: {
    type: Date,
    required: true
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  downloadId: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});


fileSchema.index({ expiryTime: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('File', fileSchema);