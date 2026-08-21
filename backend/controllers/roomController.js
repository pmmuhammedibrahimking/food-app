import mongoose from 'mongoose';
import { Room, initialRoomsStore } from '../models/roomModel.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { logAuditEvent } from './auditLogController.js';

/**
 * @desc    Get all rooms (supports search, category & status filter, sort)
 * @route   GET /api/rooms
 * @access  Public
 */
export const getRooms = async (req, res) => {
  try {
    const { search, category, status, sortBy, order } = req.query;

    if (mongoose.connection.readyState === 1) {
      let query = {};

      if (category && category !== 'All') {
        query.category = category;
      }
      if (status && status !== 'All') {
        query.status = status;
      }
      if (search) {
        query.$or = [
          { number: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } }
        ];
      }

      let sortOptions = {};
      if (sortBy === 'price') {
        sortOptions.price = order === 'desc' ? -1 : 1;
      } else if (sortBy === 'number') {
        sortOptions.number = order === 'desc' ? -1 : 1;
      } else {
        sortOptions.number = 1;
      }

      const rooms = await Room.find(query).sort(sortOptions);
      return successResponse(res, 200, 'Rooms retrieved successfully', rooms);
    }
  } catch (err) {
    console.warn('MongoDB query failed, using in-memory room store:', err.message);
  }

  // Fallback to in-memory store
  let filtered = [...initialRoomsStore];
  const { search, category, status, sortBy, order } = req.query;

  if (category && category !== 'All') {
    filtered = filtered.filter((r) => r.category === category);
  }
  if (status && status !== 'All') {
    filtered = filtered.filter((r) => r.status === status);
  }
  if (search) {
    const term = search.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.number.toLowerCase().includes(term) ||
        r.name.toLowerCase().includes(term) ||
        r.category.toLowerCase().includes(term)
    );
  }

  if (sortBy === 'price') {
    filtered.sort((a, b) => (order === 'desc' ? b.price - a.price : a.price - b.price));
  } else {
    filtered.sort((a, b) => a.number.localeCompare(b.number));
  }

  return successResponse(res, 200, 'Rooms retrieved successfully', filtered);
};

/**
 * @desc    Get single room by number
 * @route   GET /api/rooms/:number
 * @access  Public
 */
export const getRoomByNumber = async (req, res) => {
  const { number } = req.params;

  try {
    if (mongoose.connection.readyState === 1) {
      const room = await Room.findOne({ number });
      if (room) {
        return successResponse(res, 200, 'Room details fetched', room);
      }
    }
  } catch (err) {
    console.warn('MongoDB query warning:', err.message);
  }

  const room = initialRoomsStore.find((r) => r.number === number);
  if (!room) {
    return errorResponse(res, 404, `Room ${number} not found.`);
  }

  return successResponse(res, 200, 'Room details fetched', room);
};

/**
 * @desc    Add a new room to inventory
 * @route   POST /api/rooms
 * @access  Private (Admin & Manager)
 */
export const createRoom = async (req, res) => {
  try {
    const { number, name, category, price, floor, capacity, amenities, image, description, status } = req.body;

    if (!number || !name || !price) {
      return errorResponse(res, 400, 'Please provide room number, name, and price per night.');
    }

    if (mongoose.connection.readyState === 1) {
      const existing = await Room.findOne({ number });
      if (existing) {
        return errorResponse(res, 400, `Room number ${number} already exists.`);
      }

      const room = await Room.create({
        number,
        name,
        category: category || 'Suite',
        description,
        price: Number(price),
        floor: floor || '1',
        capacity: Number(capacity) || 2,
        amenities: Array.isArray(amenities) ? amenities : amenities ? amenities.split(',').map((a) => a.trim()) : [],
        image: image || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
        status: status || 'Available'
      });

      await logAuditEvent({
        user: req.user?.name || 'Admin',
        role: req.user?.role || 'Admin',
        action: 'Room created',
        module: 'Rooms',
        details: `Room #${number} (${name}) added to inventory. Price: $${price}/night`,
        relevantRecordId: String(room._id || room.id || number)
      });

      return successResponse(res, 201, `Room #${number} successfully created!`, room);
    }
  } catch (err) {
    console.warn('MongoDB save error, creating in-memory:', err.message);
  }

  const newRoom = {
    id: String(Date.now()),
    number,
    name,
    category: category || 'Suite',
    description: description || 'Luxurious resort room',
    price: Number(price),
    floor: floor || '1',
    capacity: Number(capacity) || 2,
    amenities: Array.isArray(amenities) ? amenities : ['Free Wi-Fi', 'King Bed'],
    image: image || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    status: status || 'Available'
  };

  initialRoomsStore.unshift(newRoom);
  await logAuditEvent({
    user: req.user?.name || 'Admin',
    role: req.user?.role || 'Admin',
    action: 'Room created',
    module: 'Rooms',
    details: `Room #${number} (${name}) added to inventory store. Price: $${price}/night`,
    relevantRecordId: newRoom.id
  });

  return successResponse(res, 201, `Room #${number} created!`, newRoom);
};

/**
 * @desc    Edit existing room details
 * @route   PUT /api/rooms/:number
 * @access  Private (Admin & Manager)
 */
export const updateRoom = async (req, res) => {
  const { number } = req.params;

  try {
    if (mongoose.connection.readyState === 1) {
      const room = await Room.findOneAndUpdate({ number }, req.body, { new: true, runValidators: true });
      if (room) {
        await logAuditEvent({
          user: req.user?.name || 'Admin',
          role: req.user?.role || 'Admin',
          action: 'Room updated',
          module: 'Rooms',
          details: `Room #${number} updated with new configurations.`,
          relevantRecordId: number
        });
        return successResponse(res, 200, `Room #${number} updated!`, room);
      }
    }
  } catch (err) {
    console.warn('MongoDB update warning:', err.message);
  }

  let roomIdx = initialRoomsStore.findIndex((r) => r.number === number);
  if (roomIdx === -1) {
    return errorResponse(res, 404, `Room ${number} not found.`);
  }

  initialRoomsStore[roomIdx] = { ...initialRoomsStore[roomIdx], ...req.body };
  await logAuditEvent({
    user: req.user?.name || 'Admin',
    role: req.user?.role || 'Admin',
    action: 'Room updated',
    module: 'Rooms',
    details: `Room #${number} details updated in store.`,
    relevantRecordId: number
  });

  return successResponse(res, 200, `Room #${number} updated!`, initialRoomsStore[roomIdx]);
};

/**
 * @desc    Change room status (e.g. Maintenance mode, Cleaning, Occupied)
 * @route   PATCH /api/rooms/:number/status
 * @access  Private (Admin, Manager, Receptionist, Housekeeping)
 */
export const updateRoomStatus = async (req, res) => {
  const { number } = req.params;
  const { status } = req.body;

  const validStatuses = ['Available', 'Reserved', 'Occupied', 'Cleaning', 'Maintenance'];
  if (!status || !validStatuses.includes(status)) {
    return errorResponse(res, 400, `Invalid room status. Allowed: ${validStatuses.join(', ')}`);
  }

  try {
    if (mongoose.connection.readyState === 1) {
      const room = await Room.findOneAndUpdate({ number }, { status }, { new: true });
      if (room) {
        return successResponse(res, 200, `Room #${number} status changed to ${status}`, room);
      }
    }
  } catch (err) {
    console.warn('MongoDB status update warning:', err.message);
  }

  let room = initialRoomsStore.find((r) => r.number === number);
  if (room) {
    room.status = status;
    return successResponse(res, 200, `Room #${number} status changed to ${status}`, room);
  }

  return errorResponse(res, 404, `Room ${number} not found.`);
};

/**
 * @desc    Edit Room Price
 * @route   PATCH /api/rooms/:number/price
 * @access  Private (Admin & Manager)
 */
export const updateRoomPrice = async (req, res) => {
  const { number } = req.params;
  const { price } = req.body;

  if (price === undefined || Number(price) < 0) {
    return errorResponse(res, 400, 'Please provide a valid room price per night.');
  }

  try {
    if (mongoose.connection.readyState === 1) {
      const room = await Room.findOneAndUpdate({ number }, { price: Number(price) }, { new: true });
      if (room) {
        return successResponse(res, 200, `Room #${number} price updated to $${price}/night`, room);
      }
    }
  } catch (err) {
    console.warn('MongoDB price update warning:', err.message);
  }

  let room = initialRoomsStore.find((r) => r.number === number);
  if (room) {
    room.price = Number(price);
    return successResponse(res, 200, `Room #${number} price updated to $${price}/night`, room);
  }

  return errorResponse(res, 404, `Room ${number} not found.`);
};

/**
 * @desc    Delete Room from inventory
 * @route   DELETE /api/rooms/:number
 * @access  Private (Admin & Manager)
 */
export const deleteRoom = async (req, res) => {
  const { number } = req.params;

  try {
    if (mongoose.connection.readyState === 1) {
      const deleted = await Room.findOneAndDelete({ number });
      if (deleted) {
        return successResponse(res, 200, `Room #${number} deleted from inventory.`);
      }
    }
  } catch (err) {
    console.warn('MongoDB delete warning:', err.message);
  }

  const initialLen = initialRoomsStore.length;
  const filtered = initialRoomsStore.filter((r) => r.number !== number);

  if (filtered.length < initialLen) {
    initialRoomsStore.length = 0;
    initialRoomsStore.push(...filtered);
    return successResponse(res, 200, `Room #${number} deleted from inventory.`);
  }

  return errorResponse(res, 404, `Room ${number} not found.`);
};
