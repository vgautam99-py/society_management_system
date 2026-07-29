import jwt from 'jsonwebtoken';

export const generateToken = (payload: object): string => {
  const secret = process.env.JWT_SECRET_STRING;
  if (!secret) {
    throw new Error('JWT_SECRET_STRING environment variable is missing.');
  }
  return jwt.sign(payload, secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as any,
  });
};
