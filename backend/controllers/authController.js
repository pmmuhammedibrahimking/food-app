import bcrypt from 'bcryptjs';
import { findUserByEmail, createUser } from '../models/userModel.js';
import { signJwtToken } from '../middleware/authMiddleware.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { logAuditEvent } from './auditLogController.js';

/**
 * @desc    Login Staff / Admin / Guest & Obtain JWT Token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, 'Please provide both email address and password.');
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return errorResponse(res, 401, 'Invalid authentication credentials (user not found).');
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
      return errorResponse(res, 401, 'Invalid authentication credentials (incorrect password).');
    }

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

    await logAuditEvent({
      user: user.name,
      role: user.role,
      action: 'Login',
      module: 'Auth',
      details: `${user.name} (${user.role}) logged into operations console.`,
      relevantRecordId: String(userId)
    });

    return res.status(200).json({
      success: true,
      message: `Successfully authenticated as ${user.role}!`,
      token,
      user: userObj
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

    await logAuditEvent({
      user: name,
      role: role,
      action: 'User changes',
      module: 'Users',
      details: `New account registered for ${name} (${role})`,
      relevantRecordId: String(userId)
    });

    return res.status(201).json({
      success: true,
      message: `Account created successfully for ${name}!`,
      token,
      user: userObj
    });
  } catch (error) {
    return errorResponse(res, 400, error.message || 'Failed to create account.');
  }
};

/**
 * @desc    Logout User
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logout = async (req, res) => {
  if (req.user) {
    await logAuditEvent({
      user: req.user.name || 'User',
      role: req.user.role || 'Staff',
      action: 'Logout',
      module: 'Auth',
      details: `${req.user.name || 'User'} logged out of the session.`,
      relevantRecordId: String(req.user.id || req.user._id || 'N/A')
    });
  }
  return successResponse(res, 200, 'User successfully logged out.');
};

/**
 * @desc    Get Current Authenticated User Profile
 * @route   GET /api/auth/me
 * @access  Private (JWT Protected)
 */
export const getMe = (req, res) => {
  return successResponse(res, 200, 'Current user profile fetched successfully', req.user);
};
