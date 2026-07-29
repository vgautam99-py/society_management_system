export const newUserRegistrationTemplate = (password: string, name: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #333; text-align: center;">Welcome to Society Management System!</h2>
      <p style="color: #555; font-size: 16px; line-height: 1.6;">Hi <strong>${name}</strong>,</p>
      <p style="color: #555; font-size: 16px; line-height: 1.6;">Your account has been successfully created. Please use the following credentials to log in to your account:</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #3b82f6;">
        <p style="margin: 0 0 10px 0; color: #333; font-size: 16px;"><strong>Password:</strong> 
          <span style="font-family: monospace; font-size: 18px; font-weight: bold; background: #e0e0e0; padding: 2px 6px; border-radius: 4px;">${password}</span>
        </p>
      </div>
      
      <p style="color: #555; font-size: 16px; line-height: 1.6;">We highly recommend you change your password after logging in for the first time.</p>
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
      <p style="color: #888; font-size: 14px; text-align: center;">Best regards,<br>Society Management Team</p>
    </div>
  `;
};
