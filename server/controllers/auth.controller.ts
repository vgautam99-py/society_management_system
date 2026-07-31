import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../model/user.model.js';
import Flat from '../model/flat.model.js';
import Society from '../model/society.model.js';
import { comparePassword, generateHash } from '../lib/hashPassword.js';
import { generatePassword } from '../lib/generatePassword.js';
import transporter from '../lib/sendMail.js';
import { newUserRegistrationTemplate } from '../templates/NewUserRegistration.js';
import { generateToken } from '../lib/generateToken.js';
import { twoFactorOtpTemplate } from '../templates/twoFactorOtpTemplate.js';
import { AuthenticatedRequest } from '../middleware/verifyToken.js';

// Temporary registration OTP cache
export const tempOtps = new Map<string, { otpHash: string; expires: Date }>();

// Request OTP code via Email
export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account registered with this email.' });
    }

    if (user.role !== 'Admin') {
      return res.status(403).json({ message: 'OTP verification is only available for Admin accounts.' });
    }

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    user.otp = otpHash;
    user.otpExpiresIn = new Date(Date.now() + 5 * 60 * 1000); // 5 mins validity
    await user.save();

    // Send email in the background asynchronously to prevent API timeout
    transporter.sendMail({
      from: `SMS Portal <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: '🔐 Your SMS Portal Login OTP',
      html: twoFactorOtpTemplate(otp, user.name),
    }).catch((err: any) => {
      console.warn("⚠️ SMTP service failed. Welcome email skipped:", err.message);
    });

    // Always output to console for easy testing / debugging fallback
    console.log(`✉️ [OTP Generated] User: ${user.email} | OTP Code: ${otp}`);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your registered email.',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const sendRegistrationOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'An account is already registered with this email.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    tempOtps.set(email.toLowerCase(), {
      otpHash,
      expires: new Date(Date.now() + 10 * 60 * 1000), // valid for 10 minutes
    });

    transporter.sendMail({
      from: `SMS Portal <${process.env.SMTP_USER}>`,
      to: email,
      subject: '🔐 Confirm Your SMS Portal Registration',
      html: twoFactorOtpTemplate(otp, 'Valued Resident'),
    }).catch((err: any) => {
      console.warn("⚠️ SMTP failed. Send registration OTP email skipped:", err.message);
    });

    console.log(`✉️ [Registration OTP Generated] Email: ${email} | OTP Code: ${otp}`);

    res.status(200).json({
      success: true,
      message: 'Verification OTP sent successfully to your email address.',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Register Admin & Society with OTP Verification
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, societyName, otp } = req.body;

    if (!societyName) {
      return res.status(400).json({ message: 'Society Name is required.' });
    }
    if (!password) {
      return res.status(400).json({ message: 'Password is required.' });
    }
    if (!otp) {
      return res.status(400).json({ message: 'Verification OTP is required.' });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        message: `User already exists with ${email}. Please try with another email.`,
      });
    }

    // Verify OTP
    const cachedOtp = tempOtps.get(email.toLowerCase());
    if (!cachedOtp || new Date() > cachedOtp.expires) {
      return res.status(400).json({ message: 'OTP has expired or is invalid. Please request a new OTP.' });
    }

    const match = await bcrypt.compare(otp, cachedOtp.otpHash);
    if (!match) {
      return res.status(400).json({ message: 'Invalid OTP code. Please try again.' });
    }

    // Clear registration OTP cache upon successful register
    tempOtps.delete(email.toLowerCase());

    // 1. Create the new Society
    const newSociety = await Society.create({
      name: societyName,
    });

    // 2. Hash password & create Admin user linked to the new Society
    const hashPass = await generateHash(password);

    const newUser = await User.create({
      name,
      email,
      phone: phone ? Number(phone) : undefined,
      role: 'Admin', // Registers as the Society Admin
      password: hashPass,
      society: newSociety._id,
    });

    const alluserData = await User.findById(newUser._id).select('-password');

    transporter.sendMail({
      from: `SMS Portal <${process.env.SMTP_USER}>`,
      to: newUser.email,
      subject: 'Welcome to SMS Portal - Society Admin Registered',
      html: newUserRegistrationTemplate(password, newUser.name),
    }).catch((err: any) => {
      console.warn("⚠️ SMTP service failed. Welcome email skipped:", err.message);
    });

    console.log(`🔑 [New Admin Registration] Society: ${societyName} | Admin: ${newUser.email}`);

    const payload = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      society: newUser.society,
    };
    const token = generateToken(payload);
    newUser.token = token;
    await newUser.save();

    res.cookie('token', token, {
      httpOnly: true, // Secure HTTP-only
      sameSite: 'none',
      secure: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.status(201).json({
      message: 'Registration successful',
      success: true,
      authenticated: true,
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        profilePhoto: newUser.profilePhoto,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Login (OTP or Password)
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, otp, portal } = req.body;
    const user = await User.findOne({
      $or: [
        { email: email?.toLowerCase() },
        { username: email }
      ]
    });
    if (!user) {
      return res.status(400).json({
        message: 'User is not registered, please try again',
      });
    }

    // Portal validation checks
    if (portal === 'admin' && user.role !== 'Admin') {
      return res.status(403).json({
        message: 'This email is not registered as an Admin. Please use the Others Login portal.',
      });
    }
    if (portal === 'others' && user.role === 'Admin') {
      return res.status(403).json({
        message: 'Administrators must sign in using the Admin Login portal.',
      });
    }

    if (portal === 'admin') {
      // Admin requires BOTH password AND OTP
      if (!password || !otp) {
        return res.status(400).json({
          message: 'Both Password and Email OTP are required for Admin login.',
        });
      }

      // 1. Verify Password
      if (!user.password) {
        return res.status(400).json({
          message: 'Password is not set for this account.',
        });
      }
      const isPassword = await comparePassword(password, user.password);
      if (!isPassword) {
        return res.status(401).json({
          message: 'Password is incorrect',
        });
      }

      // 2. Verify OTP code
      if (!user.otp || !user.otpExpiresIn || new Date() > user.otpExpiresIn) {
        return res.status(401).json({
          message: 'Invalid OTP or OTP expired',
        });
      }

      const match = await bcrypt.compare(otp, user.otp);
      if (!match) {
        return res.status(401).json({
          message: 'Invalid OTP or OTP expired',
        });
      }

      // Clear OTP details upon success
      user.otp = undefined;
      user.otpExpiresIn = undefined;
      await user.save();
    } else {
      // Staff/Resident requires only password
      if (!password) {
        return res.status(400).json({
          message: 'Password is required to login.',
        });
      }
      if (!user.password) {
        return res.status(400).json({
          message: 'Password is not set for this account.',
        });
      }
      const isPassword = await comparePassword(password, user.password);
      if (!isPassword) {
        return res.status(401).json({
          message: 'Password is incorrect',
        });
      }
    }

    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      society: user.society,
    };
    const token = generateToken(payload);
    user.token = token;
    await user.save();

    res.cookie('token', token, {
      httpOnly: true, // Make cookie secure and HTTP-only
      sameSite: 'none',
      secure: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.status(200).json({
      message: 'Login successful',
      success: true,
      authenticated: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        profilePhoto: user.profilePhoto,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Verify Firebase ID Token & Login Admin
export const firebaseLogin = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: 'Firebase ID Token is required.' });
    }

    // Verify Firebase ID Token by calling Firebase REST API lookup
    const apiKey = process.env.FIREBASE_API_KEY || "AIzaSyAqkBtnL01heXeV8Gi66V1RfgJyESfjpXM";
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      }
    );

    if (!response.ok) {
      const errData = await response.json();
      return res.status(401).json({ message: 'Invalid or expired Firebase ID Token.', error: errData });
    }

    const resData = await response.json();
    if (!resData.users || resData.users.length === 0) {
      return res.status(401).json({ message: 'Firebase token verification failed. User not found.' });
    }

    const firebaseEmail = resData.users[0].email;

    // Check if user is registered, role is Admin, and belongs to society
    const user = await User.findOne({ email: firebaseEmail?.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        message: `No registered account found for ${firebaseEmail}. Please register an account first.`,
      });
    }

    if (user.role !== 'Admin') {
      return res.status(403).json({
        message: 'Google Sign-In is only available for Admin accounts.',
      });
    }

    if (!user.society) {
      return res.status(400).json({
        message: 'Your account is not registered to a society. Please contact support.',
      });
    }

    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      society: user.society,
    };
    const token = generateToken(payload);
    user.token = token;
    user.firebaseToken = idToken;
    await user.save();

    res.cookie('token', token, {
      httpOnly: true, // Make cookie secure and HTTP-only
      sameSite: 'none',
      secure: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.status(200).json({
      message: 'Login successful via Google Auth',
      success: true,
      authenticated: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        profilePhoto: user.profilePhoto,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Check validation status
export const verify = async (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({
    authenticated: true,
    data: req.user,
  });
};

// Logout
export const logout = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.id) {
      await User.findByIdAndUpdate(req.user.id, { token: undefined, firebaseToken: undefined });
    }

    res.cookie('token', null, {
      maxAge: 0,
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    res.status(200).json({
      authenticated: false,
      message: 'Logout successful',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Forgot Password (generates temporary password)
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user registered with this email address' });
    }

    if (user.role !== 'Admin') {
      return res.status(403).json({ message: 'Password recovery is only available for Admin accounts. Please contact your society Admin.' });
    }

    const tempPassword = Math.floor(100000 + Math.random() * 900000).toString();
    const hashPass = await generateHash(tempPassword);

    user.password = hashPass;
    await user.save();

    transporter.sendMail({
      from: `SMS Portal <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'SMS Portal - Password Reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #1e3a8a;">Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>You requested to reset your password. We have generated a temporary password for you:</p>
          <div style="background-color: #eff6ff; padding: 16px; border-radius: 8px; text-align: center; margin: 20px 0; border: 1px solid #dbeafe;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #2563eb;">${tempPassword}</span>
          </div>
          <p>Please log in using this temporary password, and then immediately update your password in **My Settings**.</p>
          <p style="color: #64748b; font-size: 12px; margin-top: 30px;">If you did not request this, please ignore this email.</p>
        </div>
      `,
    }).catch((err: any) => {
      console.warn("⚠️ SMTP service failed. Password reset email skipped:", err.message);
    });

    console.log(`🔑 [Forgot Password Reset] User: ${user.email} | Temporary Password: ${tempPassword}`);

    res.status(200).json({
      success: true,
      message: 'A temporary password has been sent to your email (or logged in the server console).'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
