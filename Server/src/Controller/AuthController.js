import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { registerSchema, loginSchema } from '../request/AuthRequest.js';
import { admin } from '../Config/adminConfig.js';

// Helper to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new customer
// @access  Public
export const register = async (req, res) => {
  try {
    // Validate request body with Zod
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: validation.error.errors,
      });
    }

    const { name, email, password } = validation.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user (role defaults to 'customer')
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error, please try again later',
    });
  }
};

// @route   POST /api/auth/login
// @desc    Login customer or admin (generic)
// @access  Public
export const login = async (req, res) => {
  try {
    // Validate request body
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: validation.error.errors,
      });
    }

    const { email, password } = validation.data;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Guard against Google-only accounts that have no password set
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'This account was registered using Google. Please sign in with Google.',
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error, please try again later',
    });
  }
};

// @route   POST /api/auth/google
// @desc    Google OAuth Sign-In / Sign-Up
// @access  Public
export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential token is required',
      });
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      console.error('GOOGLE_CLIENT_ID is not configured in Server/.env');
      return res.status(500).json({
        success: false,
        message: 'Google authentication is not properly configured on the server',
      });
    }

    const googleClient = new OAuth2Client(googleClientId);
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Google token payload',
      });
    }

    const { email, name, sub: googleId, picture } = payload;

    // Check if user already exists with this email
    let user = await User.findOne({ email });

    if (user) {
      // Link googleId if account was previously created with email/password
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // Create new user document without password
      user = await User.create({
        name: name || 'Google User',
        email,
        googleId,
      });
    }

    // Generate JWT using the real MongoDB _id
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Google login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({
      success: false,
      message: error.message || 'Google token verification failed',
    });
  }
};

// @route   POST /api/auth/admin-login
// @desc    Admin login (optional, but you can just use /login and check role)
// @access  Public

export const adminLogin = async (req, res) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: validation.error.errors,
      });
    }

    const { email, password } = validation.data;

    // Check against hardcoded credentials
    if (email !== admin.email || password !== admin.password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials',
      });
    }

    // Create a fake user object for token generation
    const adminUser = {
      _id: 'admin_hardcoded_id',
      name: 'Admin',
      email: admin.email,
      role: 'admin',
    };

    const token = generateToken(adminUser);

    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @route   POST /api/auth/logout
// @desc    Logout user (client side will clear token)
// @access  Public (but token optional)
export const logout = (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

// @route   GET /api/admin/users
// @desc    Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};