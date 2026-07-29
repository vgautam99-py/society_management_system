export const generatePassword = (length: number): string => {
  const str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789%$!#&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += str[Math.floor(Math.random() * str.length)];
  }
  return password;
};
