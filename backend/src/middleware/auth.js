const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try { 

    // Check for Authorization header
    const authHeader = req.headers.authorization; 
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token missing or invalid' });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token
    let payload;

    try {
      payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Fetch user without password
    const user = await User.findById(payload.sub).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (err) {

     console.error('Auth Middleware Error:', err);
     return res.status(500).json({ message: 'Internal server error' });
  }
  
};

module.exports = auth;
