import bcrypt from 'bcrypt';

export const generateHash = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 12);
};

export const comparePassword = async (password: string, hashPassword?: string): Promise<boolean> => {
  if (!hashPassword) return false;
  return await bcrypt.compare(password, hashPassword);
};
