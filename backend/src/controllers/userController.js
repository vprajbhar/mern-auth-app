const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password -refreshTokens');
  return res.json(user);
};

exports.updateProfile = async (req, res) => {

  try {  

      const update = { name } = req.body;

      if (req.file) {
        update.avatar = `/uploads/avatars/${req.file.filename}`;
      }

      const user = await User.findByIdAndUpdate(req.user.id, update, { new: true }).select('-password -refreshTokens');     
      
      return res.json(user);

  } catch (error) {
    return res.status(500).json({success: false, message: "Error: "+error.message});
  }  

};

exports.changePassword = async (req, res) => {

  try {

      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user.id);
      const ok = await bcrypt.compare(currentPassword, user.password);
    
      if (!ok) return res.status(400).json({ message: 'Current password incorrect' });
      user.password = await bcrypt.hash(newPassword, 12);      
      user.refreshTokens.forEach(rt => rt.revoked = true);
      
      await user.save();

      return res.json({ message: 'Password changed' });

  } catch (error) {
    return res.status(500).json({success: false, message: "Error: "+error.message});
  } 

};
