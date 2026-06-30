const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = (...roles) => async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not logged in' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (roles.length && !roles.includes(req.user.role))
      return res.status(403).json({ message: 'Not allowed' });
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = protect;