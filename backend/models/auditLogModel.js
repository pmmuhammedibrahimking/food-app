import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
      default: 'System Admin'
    },
    role: {
      type: String,
      required: true,
      default: 'Admin'
    },
    action: {
      type: String,
      required: true
    },
    module: {
      type: String,
      required: true,
      enum: ['Auth', 'Rooms', 'Bookings', 'Housekeeping', 'Payments', 'Invoices', 'Users', 'System', 'Room Service']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    relevantRecordId: {
      type: String,
      default: 'N/A'
    },
    details: {
      type: String,
      required: true
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1'
    }
  },
  {
    timestamps: true
  }
);

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);

// In-Memory Fallback Audit Log Store
export const initialAuditLogsStore = [
  {
    id: 'LOG-101',
    user: 'System Admin',
    role: 'Admin',
    action: 'Login',
    module: 'Auth',
    timestamp: new Date().toISOString(),
    relevantRecordId: 'USR-001',
    details: 'System Admin logged in to Aurelia SaaS Operations Portal'
  },
  {
    id: 'LOG-102',
    user: 'Sarah Jenkins',
    role: 'Receptionist',
    action: 'Check-in',
    module: 'Bookings',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    relevantRecordId: 'BK-9021',
    details: 'Guest Lord Alexander Wright checked in to Penthouse Suite 401'
  },
  {
    id: 'LOG-103',
    user: 'Maria Garcia',
    role: 'Housekeeping',
    action: 'Housekeeping completed',
    module: 'Housekeeping',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    relevantRecordId: 'HK-2',
    details: 'Completed turnaround cleaning for Executive Room 102'
  }
];
