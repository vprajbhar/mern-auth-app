const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, '../uploads/avatars'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) return cb(new Error('Only images allowed'), false);
  cb(null, true);
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 }});
