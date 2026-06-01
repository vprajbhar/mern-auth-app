const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  token: String,
  createdAt: { type: Date, default: Date.now },
  revoked: { type: Boolean, default: false },
  replacedByToken: String
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  avatar: { type: String },
  roles: { type: [String], default: ['user'] },
  createdAt: { type: Date, default: Date.now },
  refreshTokens: [refreshTokenSchema],
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  emailVerified: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', UserSchema);
