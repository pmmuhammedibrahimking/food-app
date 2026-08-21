import mongoose from 'mongoose';
import { AuditLog, initialAuditLogsStore } from '../models/auditLogModel.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * Helper to record audit log programmatically across backend controllers
 */
export const logAuditEvent = async ({
  user = 'System Admin',
  role = 'Admin',
  action,
  module,
  details,
  relevantRecordId = 'N/A',
  ipAddress = '127.0.0.1'
}) => {
  const logEntry = {
    id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
    user,
    role,
    action,
    module,
    details,
    relevantRecordId,
    ipAddress,
    timestamp: new Date().toISOString()
  };

  initialAuditLogsStore.unshift(logEntry);

  if (mongoose.connection.readyState === 1) {
    try {
      await AuditLog.create({
        user,
        role,
        action,
        module,
        details,
        relevantRecordId,
        ipAddress
      });
    } catch (e) {
      console.warn('MongoDB audit log save error:', e.message);
    }
  }
};

/**
 * @desc    Get System Audit Logs (Admin Only)
 * @route   GET /api/audit-logs
 * @access  Private / Admin Only
 */
export const getAuditLogs = async (req, res) => {
  try {
    const { action, module: mod, search, startDate, endDate } = req.query;

    let logs = [];

    if (mongoose.connection.readyState === 1) {
      try {
        let query = {};
        if (action && action !== 'All') query.action = action;
        if (mod && mod !== 'All') query.module = mod;
        if (search) {
          query.$or = [
            { details: { $regex: search, $options: 'i' } },
            { user: { $regex: search, $options: 'i' } },
            { action: { $regex: search, $options: 'i' } },
            { relevantRecordId: { $regex: search, $options: 'i' } }
          ];
        }
        if (startDate || endDate) {
          query.timestamp = {};
          if (startDate) query.timestamp.$gte = new Date(startDate);
          if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        logs = await AuditLog.find(query).sort({ timestamp: -1 }).limit(200);
      } catch (err) {
        console.warn('MongoDB query failed for audit logs, falling back to memory:', err.message);
        logs = initialAuditLogsStore;
      }
    } else {
      logs = initialAuditLogsStore;
    }

    // Apply memory filters if fallback was used
    if (action && action !== 'All') {
      logs = logs.filter((l) => l.action === action);
    }
    if (search) {
      const q = search.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.details?.toLowerCase().includes(q) ||
          l.user?.toLowerCase().includes(q) ||
          l.action?.toLowerCase().includes(q) ||
          l.relevantRecordId?.toLowerCase().includes(q)
      );
    }

    return successResponse(res, 200, 'Audit logs retrieved successfully', logs);
  } catch (err) {
    console.error('getAuditLogs controller error:', err);
    return errorResponse(res, 500, 'Failed to fetch audit logs.');
  }
};

/**
 * @desc    Create Audit Log Entry (API endpoint)
 * @route   POST /api/audit-logs
 * @access  Private / Internal
 */
export const createAuditLog = async (req, res) => {
  try {
    const { user, role, action, module, details, relevantRecordId } = req.body;

    if (!action || !module || !details) {
      return errorResponse(res, 400, 'Action, module, and details are required.');
    }

    await logAuditEvent({
      user: user || req.user?.name || 'System Admin',
      role: role || req.user?.role || 'Admin',
      action,
      module,
      details,
      relevantRecordId: relevantRecordId || 'N/A',
      ipAddress: req.ip || '127.0.0.1'
    });

    return successResponse(res, 201, 'Audit log created successfully');
  } catch (err) {
    console.error('createAuditLog controller error:', err);
    return errorResponse(res, 500, 'Failed to record audit log entry.');
  }
};
