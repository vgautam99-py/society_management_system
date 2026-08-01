import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

// Express validation wrapper
export const validate = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};

// 1. User Registration Schema
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Invalid email address'),
  phone: z.union([z.number(), z.string().regex(/^\d+$/).transform(val => Number(val))]).optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  societyName: z.string().min(2, 'Society name must be at least 2 characters'),
});

// 2. Login Schema
export const loginSchema = z.object({
  email: z.string().min(3, 'Email or username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// 4. Pre-Auth Visitor Invitation Schema
export const preAuthSchema = z.object({
  name: z.string().min(2, 'Guest name is required'),
  purpose: z.string().optional(),
  flatId: z.string().min(1, 'Flat assignment is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  timeFrom: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be in HH:MM format'),
  timeTo: z.string().regex(/^\d{2}:\d{2}$/, 'End time must be in HH:MM format'),
});

// 5. Walk-in Visitor Registration Schema
export const walkInSchema = z.object({
  name: z.string().min(2, 'Visitor name is required'),
  type: z.enum(['delivery', 'electrician', 'guest', 'plumber', 'other']),
  phone: z.union([z.number(), z.string().regex(/^\d+$/).transform(val => Number(val))]),
  purpose: z.string().optional(),
  flatId: z.string().min(1, 'Destination flat is required'),
  userId: z.string().optional(),
});

// 6. Verification Passcode Schema
export const verifyPasscodeSchema = z.object({
  passcode: z.string().length(6, 'Passcode must be exactly 6 digits'),
});
