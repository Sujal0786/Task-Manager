import { AppError } from '../utils/AppError.js';

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Something went wrong';

  if (process.env.NODE_ENV !== 'production' && !err.isOperational) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  if (err.code === 11000) {
    return res.status(400).json({ message: 'Email already in use' });
  }

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV !== 'production' && !err.isOperational && { stack: err.stack }),
  });
};

export const notFound = (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
};
