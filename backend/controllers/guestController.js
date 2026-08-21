import mongoose from 'mongoose';
import { Guest, initialGuestsStore } from '../models/guestModel.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * @desc    Get all guests (supports search, VIP status filter, tags, sorting)
 * @route   GET /api/guests
 * @access  Private (Admin, Manager, Receptionist)
 */
export const getGuests = async (req, res) => {
  try {
    const { search, vipStatus, tag, sortBy, order } = req.query;

    if (mongoose.connection.readyState === 1) {
      let query = {};

      if (vipStatus && vipStatus !== 'All') {
        query.vipStatus = vipStatus;
      }
      if (tag && tag !== 'All') {
        query.tags = tag;
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { id: { $regex: search, $options: 'i' } }
        ];
      }

      let sortOptions = {};
      if (sortBy === 'totalSpent') {
        sortOptions.totalSpent = order === 'asc' ? 1 : -1;
      } else if (sortBy === 'stays') {
        sortOptions.stays = order === 'asc' ? 1 : -1;
      } else {
        sortOptions.createdAt = -1;
      }

      const guests = await Guest.find(query).sort(sortOptions);
      return successResponse(res, 200, 'Guest CRM records fetched', guests);
    }
  } catch (err) {
    console.warn('MongoDB guest query warning, using fallback:', err.message);
  }

  // Fallback to in-memory store
  let filtered = [...initialGuestsStore];
  const { search, vipStatus, tag, sortBy, order } = req.query;

  if (vipStatus && vipStatus !== 'All') {
    filtered = filtered.filter((g) => g.vipStatus === vipStatus);
  }
  if (tag && tag !== 'All') {
    filtered = filtered.filter((g) => g.tags && g.tags.includes(tag));
  }
  if (search) {
    const term = search.toLowerCase();
    filtered = filtered.filter(
      (g) =>
        g.name.toLowerCase().includes(term) ||
        g.email.toLowerCase().includes(term) ||
        (g.phone && g.phone.toLowerCase().includes(term)) ||
        g.id.toLowerCase().includes(term)
    );
  }

  if (sortBy === 'totalSpent') {
    filtered.sort((a, b) => (order === 'asc' ? a.totalSpent - b.totalSpent : b.totalSpent - a.totalSpent));
  } else if (sortBy === 'stays') {
    filtered.sort((a, b) => (order === 'asc' ? a.stays - b.stays : b.stays - a.stays));
  }

  return successResponse(res, 200, 'Guest CRM records fetched', filtered);
};

/**
 * @desc    Get single guest profile with notes and booking timeline
 * @route   GET /api/guests/:id
 * @access  Private (Admin, Manager, Receptionist)
 */
export const getGuestById = async (req, res) => {
  const { id } = req.params;

  try {
    if (mongoose.connection.readyState === 1) {
      const guest = await Guest.findOne({ $or: [{ id }, { _id: mongoose.Types.ObjectId.isValid(id) ? id : null }] });
      if (guest) {
        return successResponse(res, 200, 'Guest profile details retrieved', guest);
      }
    }
  } catch (err) {
    console.warn('MongoDB guest profile query warning:', err.message);
  }

  const guest = initialGuestsStore.find((g) => g.id === id || g.email.toLowerCase() === id.toLowerCase());
  if (!guest) {
    return errorResponse(res, 404, `Guest profile '${id}' not found.`);
  }

  return successResponse(res, 200, 'Guest profile details retrieved', guest);
};

/**
 * @desc    Create new Guest CRM Profile
 * @route   POST /api/guests
 * @access  Private (Admin, Manager, Receptionist)
 */
export const createGuest = async (req, res) => {
  try {
    const { name, email, phone, address, vipStatus, foodPreferences, roomPreferences, preferences, tags } = req.body;

    if (!name || !email) {
      return errorResponse(res, 400, 'Please provide guest full name and email address.');
    }

    const guestId = `G-${Date.now()}`;

    if (mongoose.connection.readyState === 1) {
      const guest = await Guest.create({
        id: guestId,
        name,
        email: email.toLowerCase(),
        phone: phone || 'N/A',
        address: address || 'Resort Guest Residence',
        vipStatus: vipStatus || 'Standard',
        frequentGuestStatus: vipStatus === 'Diamond' || vipStatus === 'Gold',
        stays: 1,
        totalSpent: 0,
        tags: Array.isArray(tags) ? tags : ['VIP'],
        foodPreferences: foodPreferences || 'None',
        roomPreferences: roomPreferences || 'None',
        preferences: preferences || 'None',
        notes: []
      });

      return successResponse(res, 201, `Guest profile created for ${name}!`, guest);
    }
  } catch (err) {
    console.warn('MongoDB guest creation warning:', err.message);
  }

  const newGuest = {
    id: `G-${Date.now()}`,
    name,
    email: email.toLowerCase(),
    phone: phone || 'N/A',
    address: address || 'Resort Guest Residence',
    vipStatus: vipStatus || 'Standard',
    frequentGuestStatus: vipStatus === 'Diamond' || vipStatus === 'Gold',
    stays: 1,
    totalSpent: 0,
    tags: Array.isArray(tags) ? tags : ['VIP'],
    foodPreferences: foodPreferences || 'None',
    roomPreferences: roomPreferences || 'None',
    preferences: preferences || 'None',
    notes: []
  };

  initialGuestsStore.unshift(newGuest);
  return successResponse(res, 201, `Guest profile created for ${name}!`, newGuest);
};

/**
 * @desc    Update Guest Profile & CRM Preferences
 * @route   PUT /api/guests/:id
 * @access  Private (Admin, Manager, Receptionist)
 */
export const updateGuest = async (req, res) => {
  const { id } = req.params;

  try {
    if (mongoose.connection.readyState === 1) {
      const guest = await Guest.findOneAndUpdate(
        { $or: [{ id }, { _id: mongoose.Types.ObjectId.isValid(id) ? id : null }] },
        req.body,
        { new: true, runValidators: true }
      );
      if (guest) {
        return successResponse(res, 200, `Guest CRM profile updated for ${guest.name}`, guest);
      }
    }
  } catch (err) {
    console.warn('MongoDB guest update warning:', err.message);
  }

  let idx = initialGuestsStore.findIndex((g) => g.id === id);
  if (idx === -1) {
    return errorResponse(res, 404, `Guest profile '${id}' not found.`);
  }

  initialGuestsStore[idx] = { ...initialGuestsStore[idx], ...req.body };
  return successResponse(res, 200, `Guest CRM profile updated for ${initialGuestsStore[idx].name}`, initialGuestsStore[idx]);
};

/**
 * @desc    Add Internal CRM Note to Guest Profile
 * @route   POST /api/guests/:id/notes
 * @access  Private (Admin, Manager, Receptionist)
 */
export const addGuestNote = async (req, res) => {
  const { id } = req.params;
  const { text, author } = req.body;

  if (!text || !text.trim()) {
    return errorResponse(res, 400, 'Note text is required.');
  }

  const newNote = {
    id: `NOTE-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    text,
    author: author || req.user?.name || 'Concierge Desk'
  };

  try {
    if (mongoose.connection.readyState === 1) {
      const guest = await Guest.findOne({ $or: [{ id }, { _id: mongoose.Types.ObjectId.isValid(id) ? id : null }] });
      if (guest) {
        guest.notes.unshift(newNote);
        await guest.save();
        return successResponse(res, 201, 'Internal guest CRM note added!', guest);
      }
    }
  } catch (err) {
    console.warn('MongoDB note save warning:', err.message);
  }

  let guest = initialGuestsStore.find((g) => g.id === id);
  if (guest) {
    if (!guest.notes) guest.notes = [];
    guest.notes.unshift(newNote);
    return successResponse(res, 201, 'Internal guest CRM note added!', guest);
  }

  return errorResponse(res, 404, `Guest profile '${id}' not found.`);
};

/**
 * @desc    Delete Guest CRM Profile
 * @route   DELETE /api/guests/:id
 * @access  Private (Admin & Manager)
 */
export const deleteGuest = async (req, res) => {
  const { id } = req.params;

  try {
    if (mongoose.connection.readyState === 1) {
      const deleted = await Guest.findOneAndDelete({ $or: [{ id }, { _id: mongoose.Types.ObjectId.isValid(id) ? id : null }] });
      if (deleted) {
        return successResponse(res, 200, `Guest profile '${deleted.name}' deleted successfully.`);
      }
    }
  } catch (err) {
    console.warn('MongoDB guest delete warning:', err.message);
  }

  const initialLen = initialGuestsStore.length;
  const target = initialGuestsStore.find((g) => g.id === id);
  const name = target ? target.name : id;
  const filtered = initialGuestsStore.filter((g) => g.id !== id);

  if (filtered.length < initialLen) {
    initialGuestsStore.length = 0;
    initialGuestsStore.push(...filtered);
    return successResponse(res, 200, `Guest profile '${name}' deleted.`);
  }

  return errorResponse(res, 404, `Guest profile '${id}' not found.`);
};

/**
 * @desc    Get Guest Summary CRM Statistics
 * @route   GET /api/guests/stats/summary
 * @access  Private (Admin, Manager, Receptionist)
 */
export const getGuestStatsSummary = async (req, res) => {
  try {
    let guestsList = initialGuestsStore;
    if (mongoose.connection.readyState === 1) {
      guestsList = await Guest.find({});
    }

    const totalGuests = guestsList.length;
    const vipGuests = guestsList.filter((g) => g.vipStatus && g.vipStatus !== 'Standard').length;
    const frequentGuests = guestsList.filter((g) => g.frequentGuestStatus || g.stays >= 3).length;
    const totalSpentRevenue = guestsList.reduce((acc, g) => acc + (g.totalSpent || 0), 0);

    return successResponse(res, 200, 'Guest CRM summary statistics calculated', {
      totalGuests,
      vipGuests,
      frequentGuests,
      totalSpentRevenue
    });
  } catch (err) {
    return errorResponse(res, 500, 'Failed to fetch guest CRM statistics summary.');
  }
};
