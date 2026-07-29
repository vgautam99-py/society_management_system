import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './verifyToken.js';

export const checkRole = (allowedRoles: ('Admin' | 'Staff' | 'Resident')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'you are not allowed to access this resource',
      });
    }
    next();
  };
};
