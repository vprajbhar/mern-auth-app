const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/profile', auth, userCtrl.getProfile);
router.put('/profile', auth, upload.single('avatar'), userCtrl.updateProfile);
router.post('/change-password', auth, userCtrl.changePassword);

module.exports = router;