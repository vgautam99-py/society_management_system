import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../model/user.model.js';
import Flat from '../model/flat.model.js';
import Society from '../model/society.model.js';
import { comparePassword, generateHash } from '../lib/hashPassword.js';
import { generatePassword } from '../lib/generatePassword.js';
import { generateToken } from '../lib/generateToken.js';
import { AuthenticatedRequest } from '../middleware/verifyToken.js';

// Register Admin & Society
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, societyName } = req.body;

    if (!societyName) {
      return res.status(400).json({ message: 'Society Name is required.' });
    }
    if (!password) {
      return res.status(400).json({ message: 'Password is required.' });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        message: `User already exists with ${email}. Please try with another email.`,
      });
    }

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
        planName: newUser.planName,
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

    // Verify Password
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
        planName: user.planName,
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
        planName: user.planName,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Check validation status
export const verify = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      authenticated: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        profilePhoto: user.profilePhoto,
        planName: user.planName,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
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

    console.log(`🔑 [Forgot Password Reset] User: ${user.email} | Temporary Password: ${tempPassword}`);

    res.status(200).json({
      success: true,
      message: 'Temporary password has been generated successfully and logged in the server console.',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
