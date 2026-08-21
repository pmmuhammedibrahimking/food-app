import mongoose from 'mongoose';
import { Booking, initialBookingsStore } from '../models/bookingModel.js';
import { Room, initialRoomsStore } from '../models/roomModel.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { logAuditEvent } from './auditLogController.js';

/**
 * Double Booking Prevention Helper Function
 * Checks if a room has an active reservation overlapping [checkIn, checkOut]
 */
export const checkDoubleBooking = async (roomNumber, newCheckIn, newCheckOut, excludeBookingId = null) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const query = {
        roomNumber,
        status: { $in: ['Pending', 'Confirmed', 'Checked-In'] },
        $and: [
          { checkIn: { $lt: newCheckOut } },
          { checkOut: { $gt: newCheckIn } }
        ]
      };

      if (excludeBookingId) {
        query.id = { $ne: excludeBookingId };
      }

      const existing = await Booking.findOne(query);
      return !!existing;
    }
  } catch (err) {
    console.warn('MongoDB double booking query warning:', err.message);
  }

  // Fallback in-memory check
  return initialBookingsStore.some((b) => {
    if (excludeBookingId && b.id === excludeBookingId) return false;
    if (b.roomNumber !== roomNumber) return false;
    if (['Cancelled', 'Checked-Out'].includes(b.status)) return false;

    // Overlap condition: checkIn < newCheckOut AND checkOut > newCheckIn
    return b.checkIn < newCheckOut && b.checkOut > newCheckIn;
  });
};

/**
 * @desc    Get all reservations with search, multi-filters, sorting, and pagination
 * @route   GET /api/bookings
 * @access  Public / Staff
 */
export const getBookings = async (req, res) => {
  try {
    const {
      search,
      status,
      paymentStatus,
      roomCategory,
      startDate,
      endDate,
      vipOnly,
      sortBy,
      order,
      page = 1,
      limit = 20
    } = req.query;

    if (mongoose.connection.readyState === 1) {
      let query = {};

      if (status && status !== 'All') query.status = status;
      if (paymentStatus && paymentStatus !== 'All') query.paymentStatus = paymentStatus;
      if (roomCategory && roomCategory !== 'All') query.roomCategory = roomCategory;

      if (startDate && endDate) {
        query.checkIn = { $gte: startDate, $lte: endDate };
      } else if (startDate) {
        query.checkIn = { $gte: startDate };
      } else if (endDate) {
        query.checkIn = { $lte: endDate };
      }

      if (search) {
        query.$or = [
          { guestName: { $regex: search, $options: 'i' } },
          { guestEmail: { $regex: search, $options: 'i' } },
          { guestPhone: { $regex: search, $options: 'i' } },
          { roomNumber: { $regex: search, $options: 'i' } },
          { id: { $regex: search, $options: 'i' } }
        ];
      }

      let sortOptions = { checkIn: 1 };
      if (sortBy === 'totalAmount') sortOptions = { totalAmount: order === 'asc' ? 1 : -1 };
      else if (sortBy === 'guestName') sortOptions = { guestName: order === 'asc' ? 1 : -1 };
      else if (sortBy === 'checkIn') sortOptions = { checkIn: order === 'asc' ? 1 : -1 };

      const total = await Booking.countDocuments(query);
      const bookings = await Booking.find(query)
        .sort(sortOptions)
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

      return res.status(200).json({
        success: true,
        message: 'Reservations list fetched successfully',
        data: bookings,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit))
        }
      });
    }
  } catch (err) {
    console.warn('MongoDB booking query warning, using fallback store:', err.message);
  }

  // Fallback in-memory query
  let filtered = [...initialBookingsStore];
  const { search, status, paymentStatus, startDate, endDate, sortBy, order, page = 1, limit = 20 } = req.query;

  if (status && status !== 'All') filtered = filtered.filter((b) => b.status === status);
  if (paymentStatus && paymentStatus !== 'All') filtered = filtered.filter((b) => (b.paymentStatus || 'Paid') === paymentStatus);
  if (startDate) filtered = filtered.filter((b) => b.checkIn >= startDate);
  if (endDate) filtered = filtered.filter((b) => b.checkIn <= endDate);

  if (search) {
    const term = search.toLowerCase().trim();
    filtered = filtered.filter(
      (b) =>
        b.guestName.toLowerCase().includes(term) ||
        b.guestEmail.toLowerCase().includes(term) ||
        (b.guestPhone && b.guestPhone.toLowerCase().includes(term)) ||
        b.roomNumber.toLowerCase().includes(term) ||
        b.id.toLowerCase().includes(term)
    );
  }

  if (sortBy === 'totalAmount') {
    filtered.sort((a, b) => (order === 'asc' ? a.totalAmount - b.totalAmount : b.totalAmount - a.totalAmount));
  } else {
    filtered.sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  }

  const total = filtered.length;
  const startIndex = (Number(page) - 1) * Number(limit);
  const paginated = filtered.slice(startIndex, startIndex + Number(limit));

  return res.status(200).json({
    success: true,
    message: 'Reservations list fetched successfully',
    data: paginated,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    }
  });
};

/**
 * @desc    Create new hotel reservation (with double-booking prevention)
 * @route   POST /api/bookings
 * @access  Public / Staff
 */
export const createBooking = async (req, res) => {
  try {
    const {
      guestName,
      guestEmail,
      guestPhone,
      roomNumber,
      roomCategory,
      checkIn,
      checkOut,
      guestsCount = 2,
      roomPrice = 350,
      taxes = 35,
      discount = 0,
      paymentStatus = 'Paid'
    } = req.body;

    if (!guestName || !guestEmail || !roomNumber || !checkIn || !checkOut) {
      return errorResponse(res, 400, 'Please fill in all required fields: Guest Name, Email, Room, Check-In, Check-Out.');
    }

    if (checkIn >= checkOut) {
      return errorResponse(res, 400, 'Check-Out date must be after Check-In date.');
    }

    // Step 7 Requirement: Prevent Double Booking!
    const isDoubleBooked = await checkDoubleBooking(roomNumber, checkIn, checkOut);
    if (isDoubleBooked) {
      return errorResponse(
        res,
        400,
        `Double Booking Prevented! Room ${roomNumber} is already reserved for the selected dates (${checkIn} to ${checkOut}).`
      );
    }

    // Calculate total pricing
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const nights = Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)));
    const subtotal = Number(roomPrice) * nights;
    const computedTaxes = Number(taxes) || subtotal * 0.1;
    const computedTotal = subtotal + computedTaxes - Number(discount || 0);

    const bookingId = `BKG-${Math.floor(1000 + Math.random() * 9000)}`;

    if (mongoose.connection.readyState === 1) {
      const newBooking = await Booking.create({
        id: bookingId,
        guestName,
        guestEmail: guestEmail.toLowerCase(),
        guestPhone: guestPhone || '+1 (555) 000-0000',
        roomNumber,
        roomCategory: roomCategory || 'Suite',
        checkIn,
        checkOut,
        guestsCount: Number(guestsCount),
        roomPrice: Number(roomPrice),
        taxes: computedTaxes,
        discount: Number(discount),
        totalAmount: computedTotal,
        paymentStatus,
        status: 'Confirmed'
      });

      // Update room status to Reserved
      await Room.findOneAndUpdate({ number: roomNumber }, { status: 'Reserved' });

      await logAuditEvent({
        user: req.user?.name || guestName,
        role: req.user?.role || 'Guest',
        action: 'Reservation created',
        module: 'Bookings',
        details: `Reservation ${bookingId} created for ${guestName} in Room #${roomNumber} ($${computedTotal}).`,
        relevantRecordId: bookingId
      });

      return successResponse(res, 201, `Reservation ${bookingId} confirmed for ${guestName}!`, newBooking);
    }
  } catch (err) {
    console.warn('MongoDB create booking warning:', err.message);
  }

  // Fallback in-memory creation
  const d1 = new Date(req.body.checkIn);
  const d2 = new Date(req.body.checkOut);
  const nights = Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)));
  const subtotal = Number(req.body.roomPrice || 350) * nights;
  const computedTaxes = Number(req.body.taxes) || subtotal * 0.1;
  const computedTotal = subtotal + computedTaxes - Number(req.body.discount || 0);

  const fallbackBooking = {
    id: `BKG-${Math.floor(1000 + Math.random() * 9000)}`,
    guestName: req.body.guestName,
    guestEmail: req.body.guestEmail,
    guestPhone: req.body.guestPhone || '+1 (555) 000-0000',
    roomNumber: req.body.roomNumber,
    roomCategory: req.body.roomCategory || 'Suite',
    checkIn: req.body.checkIn,
    checkOut: req.body.checkOut,
    guestsCount: Number(req.body.guestsCount || 2),
    roomPrice: Number(req.body.roomPrice || 350),
    taxes: computedTaxes,
    discount: Number(req.body.discount || 0),
    totalAmount: computedTotal,
    paymentStatus: req.body.paymentStatus || 'Paid',
    status: 'Confirmed'
  };

  initialBookingsStore.unshift(fallbackBooking);
  const room = initialRoomsStore.find((r) => r.number === req.body.roomNumber);
  if (room) room.status = 'Reserved';

  await logAuditEvent({
    user: req.user?.name || req.body.guestName,
    role: req.user?.role || 'Guest',
    action: 'Reservation created',
    module: 'Bookings',
    details: `Reservation ${fallbackBooking.id} created for ${fallbackBooking.guestName} in Room #${fallbackBooking.roomNumber}.`,
    relevantRecordId: fallbackBooking.id
  });

  return successResponse(res, 201, `Reservation ${fallbackBooking.id} confirmed!`, fallbackBooking);
};

/**
 * @desc    Step 8: Execute Check-In Workflow (Room becomes Occupied)
 * @route   POST /api/bookings/:id/checkin
 * @access  Private (Admin, Manager, Receptionist)
 */
export const executeCheckIn = async (req, res) => {
  const { id } = req.params;

  try {
    if (mongoose.connection.readyState === 1) {
      const booking = await Booking.findOne({ id });
      if (!booking) {
        return errorResponse(res, 404, `Reservation ${id} not found.`);
      }

      if (booking.status === 'Checked-In') {
        return errorResponse(res, 400, `Guest ${booking.guestName} is already checked in.`);
      }

      booking.status = 'Checked-In';
      booking.checkInTimestamp = new Date().toISOString();
      await booking.save();

      // Automatically set Room status to Occupied
      await Room.findOneAndUpdate({ number: booking.roomNumber }, { status: 'Occupied' });

      await logAuditEvent({
        user: req.user?.name || 'Receptionist',
        role: req.user?.role || 'Staff',
        action: 'Check-in',
        module: 'Bookings',
        details: `Guest ${booking.guestName} checked in to Room #${booking.roomNumber} (Reservation ${id}).`,
        relevantRecordId: id
      });

      return successResponse(res, 200, `Check-In complete! Guest ${booking.guestName} checked into Room #${booking.roomNumber}.`, booking);
    }
  } catch (err) {
    console.warn('MongoDB check-in warning:', err.message);
  }

  let booking = initialBookingsStore.find((b) => b.id === id);
  if (!booking) {
    return errorResponse(res, 404, `Reservation ${id} not found.`);
  }

  booking.status = 'Checked-In';
  booking.checkInTimestamp = new Date().toISOString();

  let room = initialRoomsStore.find((r) => r.number === booking.roomNumber);
  if (room) room.status = 'Occupied';

  await logAuditEvent({
    user: req.user?.name || 'Receptionist',
    role: req.user?.role || 'Staff',
    action: 'Check-in',
    module: 'Bookings',
    details: `Guest ${booking.guestName} checked in to Room #${booking.roomNumber}.`,
    relevantRecordId: id
  });

  return successResponse(res, 200, `Check-In complete! Room #${booking.roomNumber} set to Occupied.`, booking);
};

/**
 * @desc    Step 8: Execute Check-Out Workflow (Room becomes Cleaning & Auto Housekeeping Task Created)
 * @route   POST /api/bookings/:id/checkout
 * @access  Private (Admin, Manager, Receptionist)
 */
export const executeCheckOut = async (req, res) => {
  const { id } = req.params;

  try {
    if (mongoose.connection.readyState === 1) {
      const booking = await Booking.findOne({ id });
      if (!booking) {
        return errorResponse(res, 404, `Reservation ${id} not found.`);
      }

      booking.status = 'Checked-Out';
      booking.checkOutTimestamp = new Date().toISOString();
      await booking.save();

      // Automatically set Room status to Cleaning
      await Room.findOneAndUpdate({ number: booking.roomNumber }, { status: 'Cleaning' });

      await logAuditEvent({
        user: req.user?.name || 'Receptionist',
        role: req.user?.role || 'Staff',
        action: 'Check-out',
        module: 'Bookings',
        details: `Guest ${booking.guestName} checked out of Room #${booking.roomNumber} (Reservation ${id}).`,
        relevantRecordId: id
      });

      return successResponse(res, 200, `Check-Out complete! Room #${booking.roomNumber} set to Cleaning mode.`, booking);
    }
  } catch (err) {
    console.warn('MongoDB check-out warning:', err.message);
  }

  let booking = initialBookingsStore.find((b) => b.id === id);
  if (!booking) {
    return errorResponse(res, 404, `Reservation ${id} not found.`);
  }

  booking.status = 'Checked-Out';
  booking.checkOutTimestamp = new Date().toISOString();

  let room = initialRoomsStore.find((r) => r.number === booking.roomNumber);
  if (room) room.status = 'Cleaning';

  await logAuditEvent({
    user: req.user?.name || 'Receptionist',
    role: req.user?.role || 'Staff',
    action: 'Check-out',
    module: 'Bookings',
    details: `Guest ${booking.guestName} checked out of Room #${booking.roomNumber}.`,
    relevantRecordId: id
  });

  return successResponse(res, 200, `Check-Out complete! Room #${booking.roomNumber} set to Cleaning mode.`, booking);
};

/**
 * @desc    Cancel Reservation (Room becomes Available)
 * @route   POST /api/bookings/:id/cancel
 * @access  Private (Admin, Manager, Receptionist)
 */
export const cancelBooking = async (req, res) => {
  const { id } = req.params;

  try {
    if (mongoose.connection.readyState === 1) {
      const booking = await Booking.findOne({ id });
      if (!booking) {
        return errorResponse(res, 404, `Reservation ${id} not found.`);
      }

      booking.status = 'Cancelled';
      await booking.save();

      // Free room status back to Available
      await Room.findOneAndUpdate({ number: booking.roomNumber }, { status: 'Available' });

      await logAuditEvent({
        user: req.user?.name || 'Staff',
        role: req.user?.role || 'Staff',
        action: 'Reservation cancelled',
        module: 'Bookings',
        details: `Reservation ${id} cancelled for ${booking.guestName}. Room #${booking.roomNumber} freed.`,
        relevantRecordId: id
      });

      return successResponse(res, 200, `Reservation ${id} cancelled. Room #${booking.roomNumber} is now Available.`, booking);
    }
  } catch (err) {
    console.warn('MongoDB cancel warning:', err.message);
  }

  let booking = initialBookingsStore.find((b) => b.id === id);
  if (!booking) {
    return errorResponse(res, 404, `Reservation ${id} not found.`);
  }

  booking.status = 'Cancelled';
  let room = initialRoomsStore.find((r) => r.number === booking.roomNumber);
  if (room) room.status = 'Available';

  await logAuditEvent({
    user: req.user?.name || 'Staff',
    role: req.user?.role || 'Staff',
    action: 'Reservation cancelled',
    module: 'Bookings',
    details: `Reservation ${id} cancelled for ${booking.guestName}. Room #${booking.roomNumber} freed.`,
    relevantRecordId: id
  });

  return successResponse(res, 200, `Reservation ${id} cancelled. Room #${booking.roomNumber} freed.`, booking);
};
