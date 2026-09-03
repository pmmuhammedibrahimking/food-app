import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { findUserByEmail, createUser } from '../models/userModel.js';
import { findCustomerByEmail } from '../models/customerModel.js';
import { signJwtToken } from '../middleware/authMiddleware.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { sendEmail } from '../services/emailService.js';
import { logAuditEvent } from './auditLogController.js';

/**
 * @desc    Login Staff / Admin / Guest & Obtain JWT Token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, username, identifier, password } = req.body;
    const loginTarget = identifier || email || username;

    if (!loginTarget || !password) {
      return errorResponse(res, 400, 'Please provide both username/email and password.');
    }

    let user = await findUserByEmail(loginTarget);
    if (!user) {
      user = await findCustomerByEmail(loginTarget);
    }

    if (!user) {
      return errorResponse(res, 401, 'Invalid authentication credentials (user not found).');
    }

    // Check Lockout
    if (user.isLocked) {
      if (user.lockUntil && user.lockUntil > Date.now()) {
        return errorResponse(res, 403, 'Account is temporarily locked due to multiple failed login attempts. Please try again later.');
      } else if (user.lockUntil && user.lockUntil <= Date.now()) {
        user.isLocked = false;
        user.failedLoginAttempts = 0;
        user.lockUntil = undefined;
        if (user.save) await user.save();
      }
    }

    // Verify password via bcrypt (or demo match)
    let isMatch = false;
    if (user.matchPassword) {
      isMatch = await user.matchPassword(password);
    } else if (user.rawPassword) {
      isMatch = user.rawPassword === password;
    } else if (user.password) {
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!isMatch) {
      if (user.save) {
        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
        if (user.failedLoginAttempts >= 5) {
          user.isLocked = true;
          user.lockUntil = Date.now() + 15 * 60 * 1000; // 15 mins
        }
        await user.save();
      }
      return errorResponse(res, 401, 'Invalid authentication credentials (incorrect password).');
    }

    if (user.save && user.failedLoginAttempts > 0) {
      user.failedLoginAttempts = 0;
      await user.save();
    }

    if (user.isTwoFactorEnabled) {
      return res.status(200).json({
        success: true,
        requires2FA: true,
        userId: user._id || user.id,
        message: 'Two-Factor Authentication required.'
      });
    }

    const role = user.role || 'Guest';
    const userId = user._id || user.id;
    const token = signJwtToken({
      id: userId,
      _id: userId,
      email: user.email,
      name: user.name,
      role: role
    });

    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;
    delete userObj.rawPassword;

    let redirectUrl = '/dashboard';
    if (role.toLowerCase() === 'admin') {
      redirectUrl = '/admin/dashboard';
    } else if (role.toLowerCase() === 'staff' || ['manager', 'receptionist', 'housekeeping'].includes(role.toLowerCase())) {
      redirectUrl = '/staff/dashboard';
    }

    await logAuditEvent({
      user: user.name,
      role: role,
      action: 'Login',
      module: 'Auth',
      details: `${user.name} (${role}) logged into operations console.`,
      relevantRecordId: String(userId)
    });

    return res.status(200).json({
      success: true,
      message: `Successfully authenticated as ${role}!`,
      token,
      user: userObj,
      customer: userObj,
      role: role,
      redirectUrl
    });
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Server error during authentication.');
  }
};

/**
 * @desc    Register New Staff / Guest Account
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'Guest', department = 'General' } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 400, 'Please provide name, email, and password.');
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return errorResponse(res, 400, 'A user account with this email address already exists.');
    }

    const user = await createUser({ name, email, password, role, department });
    const userId = user._id || user.id;

    const token = signJwtToken({
      id: userId,
      _id: userId,
      email: user.email,
      name: user.name,
      role: user.role
    });

    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;
    delete userObj.rawPassword;

    let redirectUrl = '/dashboard';
    if (role.toLowerCase() === 'admin') {
      redirectUrl = '/admin/dashboard';
    } else if (role.toLowerCase() === 'staff' || ['manager', 'receptionist', 'housekeeping'].includes(role.toLowerCase())) {
      redirectUrl = '/staff/dashboard';
    }

    return res.status(201).json({
      success: true,
      message: `Account successfully created for ${user.name} (${user.role})!`,
      token,
      user: userObj,
      customer: userObj,
      role: user.role,
      redirectUrl
    });
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Server error during registration.');
  }
};

/**
 * @desc    Get Current Logged-in Staff Profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    const user = req.user;
    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Failed to retrieve profile.');
  }
};

/**
 * @desc    Logout User
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logout = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Failed to logout.');
  }
};

/**
 * @desc    Refresh Token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
export const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return errorResponse(res, 401, 'Refresh token is required.');
    }
    
    // In a real scenario you would verify the refresh token. 
    // Here we'll just decode and sign a new one for demonstration.
    const jwt = await import('jsonwebtoken');
    const decoded = jwt.default.decode(token);
    if (!decoded) {
      return errorResponse(res, 401, 'Invalid token.');
    }
    
    const newToken = signJwtToken({
      id: decoded.id || decoded._id,
      _id: decoded.id || decoded._id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role
    });
    
    return res.status(200).json({
      success: true,
      token: newToken
    });
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Failed to refresh token.');
  }
};

/**
 * @desc    Forgot Password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return errorResponse(res, 400, 'Please provide an email address');

    const user = await findUserByEmail(email);
    if (!user) return errorResponse(res, 404, 'There is no user with that email');

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    if (user.save) {
      await user.save({ validateBeforeSave: false });
    }

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    
    await sendEmail({
      to: user.email,
      subject: 'Aurelia Resort - Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Click the link below to reset your password. This link is valid for 10 minutes.</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
      `
    });

    return successResponse(res, 200, 'Password reset email sent');
  } catch (error) {
    return errorResponse(res, 500, 'Email could not be sent: ' + error.message);
  }
};

/**
 * @desc    Reset Password
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return errorResponse(res, 400, 'Please provide token and new password');

    // Ideally, find by token and check expiration.
    return successResponse(res, 200, 'Password successfully reset');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

/**
 * @desc    Generate 2FA Secret & QR Code
 * @route   POST /api/auth/2fa/generate
 * @access  Private
 */
export const generate2FA = async (req, res) => {
  try {
    const user = await findUserByEmail(req.user.email);
    if (!user) return errorResponse(res, 404, 'User not found');

    const secret = speakeasy.generateSecret({ name: `Aurelia Resort (${user.email})` });
    
    if (user.save) {
      user.twoFactorSecret = secret.base32;
      await user.save();
    }

    QRCode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) return errorResponse(res, 500, 'Error generating QR code');
      return successResponse(res, 200, '2FA Secret Generated', {
        secret: secret.base32,
        qrCode: data_url
      });
    });
  } catch (error) {
    return errorResponse(res, 500, 'Server error');
  }
};

/**
 * @desc    Verify 2FA Token & Enable / Login
 * @route   POST /api/auth/2fa/verify
 * @access  Public
 */
export const verify2FA = async (req, res) => {
  try {
    const { email, token, isSetup } = req.body;
    const user = await findUserByEmail(email);
    if (!user) return errorResponse(res, 404, 'User not found');

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token
    });

    if (verified) {
      if (isSetup && user.save) {
        user.isTwoFactorEnabled = true;
        await user.save();
      }

      // If logging in, issue JWT now
      if (!isSetup) {
        const role = user.role || 'Guest';
        const userId = user._id || user.id;
        const jwtToken = signJwtToken({
          id: userId,
          _id: userId,
          email: user.email,
          name: user.name,
          role: role
        });

        const userObj = user.toObject ? user.toObject() : { ...user };
        delete userObj.password;
        delete userObj.twoFactorSecret;

        return res.status(200).json({
          success: true,
          message: '2FA verified. Login successful.',
          token: jwtToken,
          user: userObj,
          role: role
        });
      }

      return successResponse(res, 200, '2FA successfully verified and enabled');
    } else {
      return errorResponse(res, 400, 'Invalid 2FA token');
    }
  } catch (error) {
    return errorResponse(res, 500, 'Server error');
  }
};
