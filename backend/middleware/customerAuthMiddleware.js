import jwt from 'jsonwebtoken';
import { findCustomerById } from '../models/customerModel.js';

const JWT_SECRET = process.env.JWT_SECRET || 'aurelia_super_secret_jwt_key_2026';

/**
 * Sign Customer JWT Token
 */
export const signCustomerToken = (payload, expiresIn = '30d') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * Verify Customer JWT Token
 */
export const verifyCustomerToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

/**
 * Protect Customer Middleware
 */
export const protectCustomer = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.headers['x-customer-token'] || req.headers['x-access-token']) {
    token = req.headers['x-customer-token'] || req.headers['x-access-token'];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: Customer authentication required. Please sign in.'
    });
  }

  const decoded = verifyCustomerToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired customer session token.'
    });
  }

  const customerId = decoded.id || decoded._id;
  const customer = await findCustomerById(customerId);

  if (!customer) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Customer account no longer exists.'
    });
  }

  const customerObj = customer.toObject ? customer.toObject() : { ...customer };
  delete customerObj.password;
  delete customerObj.rawPassword;
  req.customer = customerObj;
  next();
};
