import jwt from 'jsonwebtoken';
import User from '../model/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

      // Add user to request
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }
    
    // Super manager can do anything, or check if user role is in allowed roles
    if (req.user.role === 'admin' || roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: 'Forbidden. You do not have permission.' });
    }
  };
};
