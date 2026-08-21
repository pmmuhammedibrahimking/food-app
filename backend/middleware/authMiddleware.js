import jwt from 'jsonwebtoken';
import { findUserById } from '../models/userModel.js';

const JWT_SECRET = process.env.JWT_SECRET || 'aurelia_super_secret_jwt_key_2026';

/**
 * Sign JWT Token Helper
 */
export const signJwtToken = (payload, expiresIn = '24h') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * Verify JWT Token Helper
 */
export const verifyJwtToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

/**
 * Protect Middleware — Validates Bearer token & attaches req.user
 */
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.headers['x-access-token']) {
    token = req.headers['x-access-token'];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: No JWT authentication token provided.'
    });
  }

  const decoded = verifyJwtToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired JWT authentication token.'
    });
  }

  const user = await findUserById(decoded.id || decoded._id);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Staff/User belonging to this token no longer exists.'
    });
  }

  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;
  req.user = userObj;
  next();
};

/**
 * Authorize Middleware — Enforces role-based authorization
 * Roles: 'Admin', 'Manager', 'Receptionist', 'Housekeeping', 'Guest'
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User authentication required.'
      });
    }

    // Admin or General Manager has access to everything
    if (req.user.role === 'Admin' || req.user.role === 'General Manager') {
      return next();
    }

    const normalizedRole = req.user.role === 'General Manager' ? 'Manager' : req.user.role;
    if (!allowedRoles.includes(req.user.role) && !allowedRoles.includes(normalizedRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' is not authorized to access this resource. Required role(s): ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};
