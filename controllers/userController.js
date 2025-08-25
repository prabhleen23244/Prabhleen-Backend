import User from '../models/User.js';
import File from '../models/File.js';


const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }
    
    user.name = name || user.name;
    user.email = email || user.email;
    
    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const deleteUserAccount = async (req, res) => {
  try {
    
    await File.deleteMany({ uploadedBy: req.user._id });
    

    await User.findByIdAndDelete(req.user._id);
    
    res.json({ message: 'User account and all associated files deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;
    

    const totalFiles = await File.countDocuments({ uploadedBy: userId });
    
    
    const totalDownloadsResult = await File.aggregate([
      { $match: { uploadedBy: userId } },
      { $group: { _id: null, totalDownloads: { $sum: '$downloadCount' } } }
    ]);
    
    const totalDownloads = totalDownloadsResult.length > 0 ? totalDownloadsResult[0].totalDownloads : 0;
    
    
    const soonToExpire = await File.countDocuments({
      uploadedBy: userId,
      expiryTime: { $lte: new Date(Date.now() + 24 * 60 * 60 * 1000) },
      expiryTime: { $gt: new Date() }
    });
    
    res.json({
      totalFiles,
      totalDownloads,
      soonToExpire
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteUserAccount,
  getUserStats
};