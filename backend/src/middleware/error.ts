import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Unhandled Application Error:', err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Safeguard: do not leak detailed system error details in production to clients
  res.status(status).json({
    error: status === 500 ? 'An unexpected server error occurred. Please try again later.' : message,
    status
  });
};
