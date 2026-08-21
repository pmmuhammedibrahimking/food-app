import mongoose from 'mongoose';
import { HousekeepingTask, initialHousekeepingStore } from '../models/housekeepingModel.js';
import { Room, initialRoomsStore } from '../models/roomModel.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { logAuditEvent } from './auditLogController.js';

/**
 * @desc    Get all Housekeeping Tasks
 * @route   GET /api/housekeeping
 * @access  Private (Staff)
 */
export const getHousekeepingTasks = async (req, res) => {
  try {
    const { status, roomNumber } = req.query;

    if (mongoose.connection.readyState === 1) {
      let query = {};
      if (status && status !== 'All') query.status = status;
      if (roomNumber) query.roomNumber = roomNumber;

      const tasks = await HousekeepingTask.find(query).sort({ createdAt: -1 });
      return successResponse(res, 200, 'Housekeeping tasks retrieved', tasks);
    }
  } catch (err) {
    console.warn('MongoDB housekeeping query warning:', err.message);
  }

  let filtered = [...initialHousekeepingStore];
  const { status, roomNumber } = req.query;
  if (status && status !== 'All') filtered = filtered.filter((t) => t.status === status);
  if (roomNumber) filtered = filtered.filter((t) => t.roomNumber === roomNumber);

  return successResponse(res, 200, 'Housekeeping tasks retrieved', filtered);
};

/**
 * @desc    Create new Housekeeping Cleaning Task
 * @route   POST /api/housekeeping
 * @access  Private (Staff)
 */
export const createHousekeepingTask = async (req, res) => {
  try {
    const { roomNumber, type = 'Departure Turnaround Clean', assignee = 'Unassigned', priority = 'High', notes = '' } = req.body;

    if (!roomNumber) {
      return errorResponse(res, 400, 'Room number is required to dispatch housekeeping task.');
    }

    const taskId = `HK-${Date.now()}`;

    if (mongoose.connection.readyState === 1) {
      const task = await HousekeepingTask.create({
        id: taskId,
        roomNumber,
        type,
        assignee,
        priority,
        status: 'Pending',
        notes
      });

      // Update room status to Cleaning
      await Room.findOneAndUpdate({ number: roomNumber }, { status: 'Cleaning' });

      return successResponse(res, 201, `Housekeeping task ${taskId} created for Room #${roomNumber}!`, task);
    }
  } catch (err) {
    console.warn('MongoDB task create warning:', err.message);
  }

  const newTask = {
    id: `HK-${Date.now()}`,
    roomNumber: req.body.roomNumber,
    type: req.body.type || 'Departure Turnaround Clean',
    assignee: req.body.assignee || 'Unassigned',
    priority: req.body.priority || 'High',
    status: 'Pending',
    notes: req.body.notes || ''
  };

  initialHousekeepingStore.unshift(newTask);
  const room = initialRoomsStore.find((r) => r.number === req.body.roomNumber);
  if (room) room.status = 'Cleaning';

  return successResponse(res, 201, `Housekeeping task created for Room #${req.body.roomNumber}!`, newTask);
};

/**
 * @desc    Update Task Status (When set to Completed -> Room becomes Available!)
 * @route   PATCH /api/housekeeping/:id/status
 * @access  Private (Staff)
 */
export const updateHousekeepingStatus = async (req, res) => {
  const { id } = req.params;
  const { status, assignee } = req.body;

  const validStatuses = ['Pending', 'Assigned', 'Cleaning', 'Inspection', 'Completed'];
  if (!status || !validStatuses.includes(status)) {
    return errorResponse(res, 400, `Invalid housekeeping status. Allowed: ${validStatuses.join(', ')}`);
  }

  try {
    if (mongoose.connection.readyState === 1) {
      const task = await HousekeepingTask.findOne({ id });
      if (task) {
        task.status = status;
        if (assignee) task.assignee = assignee;
        if (status === 'Completed') {
          task.completedTimestamp = new Date().toISOString();
          // Requirement: When cleaning is completed and approved -> Room status becomes Available!
          await Room.findOneAndUpdate({ number: task.roomNumber }, { status: 'Available' });

          await logAuditEvent({
            user: req.user?.name || assignee || 'Housekeeping Team',
            role: req.user?.role || 'Housekeeping',
            action: 'Housekeeping completed',
            module: 'Housekeeping',
            details: `Housekeeping turnaround task ${id} completed for Room #${task.roomNumber}. Room is now Available.`,
            relevantRecordId: id
          });
        }
        await task.save();
        return successResponse(res, 200, `Housekeeping task ${id} set to ${status}!`, task);
      }
    }
  } catch (err) {
    console.warn('MongoDB task update warning:', err.message);
  }

  let task = initialHousekeepingStore.find((t) => t.id === id);
  if (task) {
    task.status = status;
    if (assignee) task.assignee = assignee;
    if (status === 'Completed') {
      task.completedTimestamp = new Date().toISOString();
      let room = initialRoomsStore.find((r) => r.number === task.roomNumber);
      if (room) room.status = 'Available';

      await logAuditEvent({
        user: req.user?.name || assignee || 'Housekeeping Team',
        role: req.user?.role || 'Housekeeping',
        action: 'Housekeeping completed',
        module: 'Housekeeping',
        details: `Housekeeping turnaround task ${id} completed for Room #${task.roomNumber}. Room is now Available.`,
        relevantRecordId: id
      });
    }
    return successResponse(res, 200, `Housekeeping task ${id} set to ${status}!`, task);
  }

  return errorResponse(res, 404, `Housekeeping task ${id} not found.`);
};
