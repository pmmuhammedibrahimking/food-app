import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import {
  Customer,
  findCustomerByEmail,
  findCustomerById,
  findCustomerByResetToken,
  createCustomer,
  inMemoryCustomers
} from '../models/customerModel.js';
import { signCustomerToken } from '../middleware/customerAuthMiddleware.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { logAuditEvent } from './auditLogController.js';

/**
 * @desc    Register New Customer Account
 * @route   POST /api/customer/auth/register
 * @access  Public
 */
export const registerCustomer = async (req, res) => {
  try {
    const { name, username, email, phone, password, confirmPassword, acceptTerms } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 400, 'Please provide Full Name, Email Address, and Password.');
    }

    if (password.length < 6) {
      return errorResponse(res, 400, 'Password must be at least 6 characters long.');
    }

    if (confirmPassword && password !== confirmPassword) {
      return errorResponse(res, 400, 'Password confirmation does not match.');
    }

    // Duplicate email verification
    const existing = await findCustomerByEmail(email);
    if (existing) {
      return errorResponse(res, 400, 'An account with this email address is already registered. Please sign in.');
    }

    const cleanUsername = (username || email.split('@')[0] || name.toLowerCase().replace(/\s+/g, '')).trim().toLowerCase();

    const newCustomer = await createCustomer({
      name: name.trim(),
      username: cleanUsername,
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      password: password
    });

    const customerId = newCustomer._id || newCustomer.id;
    const token = signCustomerToken({
      id: customerId,
      _id: customerId,
      email: newCustomer.email,
      name: newCustomer.name,
      role: 'Customer'
    });

    const customerObj = newCustomer.toObject ? newCustomer.toObject() : { ...newCustomer };
    delete customerObj.password;
    delete customerObj.rawPassword;

    await logAuditEvent({
      user: name,
      role: 'Customer',
      action: 'Customer Registered',
      module: 'CustomerAuth',
      details: `New customer account created for ${name} (${email})`,
      relevantRecordId: String(customerId)
    });

    return res.status(201).json({
      success: true,
      message: `Welcome to Aurelia Grand Resort, ${name}! Your account is ready.`,
      token,
      customer: customerObj
    });
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Server error during customer registration.');
  }
};

/**
 * @desc    Customer Login
 * @route   POST /api/customer/auth/login
 * @access  Public
 */
export const loginCustomer = async (req, res) => {
  try {
    const { email, username, identifier, password, rememberMe } = req.body;
    const loginTarget = identifier || email || username;

    if (!loginTarget || !password) {
      return errorResponse(res, 400, 'Please provide both username/email and password.');
    }

    const customer = await findCustomerByEmail(loginTarget);
    if (!customer) {
      return errorResponse(res, 401, 'No registered customer account found with this username or email.');
    }

    // Verify password via bcrypt or matchPassword
    let isMatch = false;
    if (customer.matchPassword) {
      isMatch = await customer.matchPassword(password);
    } else if (customer.rawPassword) {
      isMatch = customer.rawPassword === password;
    } else if (customer.password) {
      isMatch = await bcrypt.compare(password, customer.password);
    }

    if (!isMatch) {
      return errorResponse(res, 401, 'Invalid password. Please check your credentials and try again.');
    }

    const customerId = customer._id || customer.id;
    const expiresIn = rememberMe ? '30d' : '7d';
    const token = signCustomerToken(
      {
        id: customerId,
        _id: customerId,
        email: customer.email,
        name: customer.name,
        role: 'Customer'
      },
      expiresIn
    );

    const customerObj = customer.toObject ? customer.toObject() : { ...customer };
    delete customerObj.password;
    delete customerObj.rawPassword;

    await logAuditEvent({
      user: customer.name,
      role: 'Customer',
      action: 'Customer Login',
      module: 'CustomerAuth',
      details: `${customer.name} signed into Customer Portal.`,
      relevantRecordId: String(customerId)
    });

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${customer.name}!`,
      token,
      customer: customerObj
    });
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Server error during customer login.');
  }
};

/**
 * @desc    Forgot Password - Generate Reset Token
 * @route   POST /api/customer/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, 400, 'Please provide your registered email address.');
    }

    const customer = await findCustomerByEmail(email);
    if (!customer) {
      // Return safe message without exposing whether user exists
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a password reset link and code have been generated.'
      });
    }

    // Generate random 6-character reset token
    const resetToken = crypto.randomBytes(3).toString('hex').toUpperCase(); // e.g. 8A3F12
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    if (customer.save) {
      customer.resetPasswordToken = resetToken;
      customer.resetPasswordExpires = resetExpires;
      await customer.save();
    } else {
      customer.resetPasswordToken = resetToken;
      customer.resetPasswordExpires = resetExpires;
    }

    console.log(`\n==================================================`);
    console.log(`🔐 [PASSWORD RESET TOKEN DISPATCH]`);
    console.log(`To Customer: ${customer.email}`);
    console.log(`Reset Code: ${resetToken}`);
    console.log(`Expires: 1 Hour (${resetExpires.toISOString()})`);
    console.log(`==================================================\n`);

    return res.status(200).json({
      success: true,
      message: `Password reset verification instructions sent to ${customer.email}.`,
      resetToken, // Returned for effortless demo / testing in UI
      expiresAt: resetExpires.toISOString()
    });
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Failed to process forgot password request.');
  }
};

/**
 * @desc    Reset Password with Token
 * @route   POST /api/customer/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword) {
      return errorResponse(res, 400, 'Reset token and new password are required.');
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 400, 'Password must be at least 6 characters long.');
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return errorResponse(res, 400, 'Passwords do not match.');
    }

    const customer = await findCustomerByResetToken(token.trim().toUpperCase());
    if (!customer) {
      return errorResponse(res, 400, 'Invalid or expired password reset token.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    if (customer.save) {
      customer.password = hashedPassword;
      customer.resetPasswordToken = undefined;
      customer.resetPasswordExpires = undefined;
      await customer.save();
    } else {
      customer.password = hashedPassword;
      customer.rawPassword = newPassword;
      delete customer.resetPasswordToken;
      delete customer.resetPasswordExpires;
    }

    await logAuditEvent({
      user: customer.name,
      role: 'Customer',
      action: 'Password Reset',
      module: 'CustomerAuth',
      details: `${customer.name} reset their customer account password.`,
      relevantRecordId: String(customer._id || customer.id)
    });

    return res.status(200).json({
      success: true,
      message: 'Your password has been successfully reset! You can now log in with your new password.'
    });
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Failed to reset password.');
  }
};

/**
 * @desc    Get Current Customer Profile
 * @route   GET /api/customer/auth/me
 * @access  Private (Customer JWT Protected)
 */
export const getCustomerMe = async (req, res) => {
  return successResponse(res, 200, 'Customer profile retrieved successfully.', req.customer);
};

/**
 * @desc    Update Customer Profile
 * @route   PUT /api/customer/auth/profile
 * @access  Private (Customer JWT Protected)
 */
export const updateCustomerProfile = async (req, res) => {
  try {
    const customerId = req.customer.id || req.customer._id;
    const { name, phone, address, avatar, foodPreferences, roomPreferences } = req.body;

    let customer = await findCustomerById(customerId);
    if (!customer) {
      return errorResponse(res, 404, 'Customer account not found.');
    }

    if (customer.save) {
      if (name) customer.name = name;
      if (phone !== undefined) customer.phone = phone;
      if (address !== undefined) customer.address = address;
      if (avatar) customer.avatar = avatar;
      if (foodPreferences !== undefined) customer.foodPreferences = foodPreferences;
      if (roomPreferences !== undefined) customer.roomPreferences = roomPreferences;
      await customer.save();
    } else {
      if (name) customer.name = name;
      if (phone !== undefined) customer.phone = phone;
      if (address !== undefined) customer.address = address;
      if (avatar) customer.avatar = avatar;
      if (foodPreferences !== undefined) customer.foodPreferences = foodPreferences;
      if (roomPreferences !== undefined) customer.roomPreferences = roomPreferences;
      customer.updatedAt = new Date().toISOString();
    }

    const customerObj = customer.toObject ? customer.toObject() : { ...customer };
    delete customerObj.password;
    delete customerObj.rawPassword;

    return res.status(200).json({
      success: true,
      message: 'Profile information updated successfully!',
      customer: customerObj
    });
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Failed to update profile.');
  }
};

/**
 * @desc    Change Password
 * @route   PUT /api/customer/auth/change-password
 * @access  Private (Customer JWT Protected)
 */
export const changeCustomerPassword = async (req, res) => {
  try {
    const customerId = req.customer.id || req.customer._id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 400, 'Current and new password are required.');
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 400, 'New password must be at least 6 characters long.');
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return errorResponse(res, 400, 'New password confirmation does not match.');
    }

    let customer = await findCustomerById(customerId);
    if (!customer) {
      return errorResponse(res, 404, 'Customer account not found.');
    }

    // Verify current password
    let isMatch = false;
    if (customer.matchPassword) {
      isMatch = await customer.matchPassword(currentPassword);
    } else if (customer.rawPassword) {
      isMatch = customer.rawPassword === currentPassword;
    } else if (customer.password) {
      isMatch = await bcrypt.compare(currentPassword, customer.password);
    }

    if (!isMatch) {
      return errorResponse(res, 400, 'Current password is incorrect.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    if (customer.save) {
      customer.password = hashedPassword;
      await customer.save();
    } else {
      customer.password = hashedPassword;
      customer.rawPassword = newPassword;
      customer.updatedAt = new Date().toISOString();
    }

    return res.status(200).json({
      success: true,
      message: 'Password successfully changed!'
    });
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Failed to change password.');
  }
};

/**
 * @desc    Toggle Favorite Room
 * @route   POST /api/customer/favorites/:roomNumber
 * @access  Private (Customer JWT Protected)
 */
export const toggleFavorite = async (req, res) => {
  try {
    const customerId = req.customer.id || req.customer._id;
    const { roomNumber } = req.params;

    let customer = await findCustomerById(customerId);
    if (!customer) {
      return errorResponse(res, 404, 'Customer account not found.');
    }

    let favorites = customer.favorites || [];
    let isFavorited = favorites.includes(roomNumber);

    if (isFavorited) {
      favorites = favorites.filter((r) => r !== roomNumber);
    } else {
      favorites.push(roomNumber);
    }

    if (customer.save) {
      customer.favorites = favorites;
      await customer.save();
    } else {
      customer.favorites = favorites;
    }

    return res.status(200).json({
      success: true,
      favorites,
      isFavorited: !isFavorited,
      message: !isFavorited
        ? `Room ${roomNumber} saved to your favorites!`
        : `Room ${roomNumber} removed from favorites.`
    });
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Failed to toggle favorite.');
  }
};
