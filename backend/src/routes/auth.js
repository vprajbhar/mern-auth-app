// shortened, see full implementation in prior message
const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const Joi = require('joi');
const validate = require('../middleware/validate');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 100 });

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(5).required()
});

const loginSchema = Joi.object({ 
  email: Joi.string().email().required(), 
  password: Joi.string().required() 
});


router.post('/register', authLimiter, validate(registerSchema), authCtrl.register);
router.post('/login', authLimiter, validate(loginSchema), authCtrl.login);
router.post('/refresh', authCtrl.refresh);
router.post('/logout', authCtrl.logout);
router.post('/forgot-password', authCtrl.forgotPassword);
router.post('/reset-password', authCtrl.resetPassword);

module.exports = router;
