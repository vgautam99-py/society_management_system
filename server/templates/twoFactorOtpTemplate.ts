export const twoFactorOtpTemplate = (otp: string, name: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #333; text-align: center;">Two-Factor Authentication Verification</h2>
      
      <p style="color: #555; font-size: 16px; line-height: 1.6;">
        Hi <strong>${name}</strong>,
      </p>
      
      <p style="color: #555; font-size: 16px; line-height: 1.6;">
        We received a request to verify your identity. Please use the following One-Time Password (OTP) to complete the login process:
      </p>

      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #3b82f6; text-align: center;">
        <p style="margin: 0; color: #333; font-size: 14px;">
          Your Verification Code
        </p>
        <p style="margin: 10px 0 0 0; font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2563eb;">
          ${otp}
        </p>
      </div>

      <p style="color: #555; font-size: 16px; line-height: 1.6;">
        This OTP is valid for <strong>5 minutes</strong>.
      </p>

      <p style="color: #ef4444; font-size: 15px; line-height: 1.6;">
        If you did not attempt to log in, please ignore this email and consider changing your password immediately.
      </p>

      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">

      <p style="color: #888; font-size: 14px; text-align: center;">
        Best regards,<br>
        Society Management Team
      </p>
    </div>
  `;
};
