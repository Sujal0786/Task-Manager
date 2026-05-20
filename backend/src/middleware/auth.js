import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const [type, token] = header.split(' ');
    if (type !== 'Bearer' || !token) {
      throw new AppError('Not authorized, token missing', 401);
    }
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.sub);
    if (!user) {
      throw new AppError('User not found', 401);
    }
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new AppError('Not authorized, invalid token', 401));
    }
    next(err);
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return next(new AppError('Admin access required', 403));
  }
  next();
};
