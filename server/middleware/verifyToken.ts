import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    username?: string;
    role: 'Admin' | 'Staff' | 'Resident';
    society?: string;
  };
  io?: any;
  file?: any;
}

const verifyToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: No token provided.',
      });
    }

    const secret = process.env.JWT_SECRET_STRING;
    if (!secret) {
      throw new Error('JWT_SECRET_STRING environment variable is missing.');
    }

    const decoded = jwt.verify(token, secret) as AuthenticatedRequest['user'];
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: Invalid token.',
      });
    }

    // Attach user info to request object
    req.user = decoded;
    next();
  } catch (error: any) {
    console.error('JWT Verification Error:', error.message);

    let statusCode = 401;
    let message = 'Authentication failed.';

    if (error.name === 'TokenExpiredError') {
      message = 'Session expired. Please log in again.';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token. Please log in again.';
    }

    return res.status(statusCode).json({
      success: false,
      message,
      error: error.message,
    });
  }
};

export default verifyToken;
