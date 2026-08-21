import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { initialRoomsStore, Room } from '../models/roomModel.js';
import { initialBookingsStore, Booking } from '../models/bookingModel.js';
import { initialHousekeepingStore, HousekeepingTask } from '../models/housekeepingModel.js';
import mongoose from 'mongoose';

/**
 * Controlled Backend Tool Functions for Hotel Operations
 * (The AI does not access DB directly, it calls these controlled functions)
 */
async function getAvailableRooms() {
  if (mongoose.connection.readyState === 1) {
    try {
      const rooms = await Room.find({ status: 'Available' });
      if (rooms.length > 0) return rooms;
    } catch (e) {
      console.warn('MongoDB available rooms fetch warning:', e.message);
    }
  }
  return initialRoomsStore.filter((r) => r.status === 'Available');
}

async function getGuestBooking(guestId, roomNumber, bookingId) {
  if (mongoose.connection.readyState === 1) {
    try {
      let query = {};
      if (bookingId) query.id = bookingId;
      else if (roomNumber) query.roomNumber = roomNumber;
      else if (guestId) query.guestId = guestId;

      const booking = await Booking.findOne(query);
      if (booking) return booking;
    } catch (e) {
      console.warn('MongoDB booking fetch warning:', e.message);
    }
  }

  // Fallback to in-memory store
  if (bookingId) {
    const found = initialBookingsStore.find((b) => b.id === bookingId);
    if (found) return found;
  }
  if (roomNumber) {
    const found = initialBookingsStore.find((b) => b.roomNumber === roomNumber);
    if (found) return found;
  }
  return initialBookingsStore[0] || {
    id: 'BK-3891',
    guestName: 'Eleanor Vance',
    roomNumber: '101',
    roomCategory: 'Suite',
    checkIn: '2026-08-10',
    checkOut: '2026-08-15',
    totalAmount: 1750,
    paymentStatus: 'Paid',
    status: 'CheckedIn'
  };
}

/**
 * @desc    AI Concierge Guest Assistant Chat Controller
 * @route   POST /api/ai/chat
 * @access  Public / Guest
 */
export const handleAiChat = async (req, res) => {
  try {
    const { message, guestId, roomNumber, guestName, bookingId } = req.body;

    if (!message || !message.trim()) {
      return errorResponse(res, 400, 'Please provide a chat message prompt.');
    }

    const lowerMsg = message.toLowerCase().trim();
    let reply = '';
    let actionRequired = null;

    // Check if OPENAI_API_KEY is available for backend integration
    if (process.env.OPENAI_API_KEY) {
      try {
        const availableRooms = await getAvailableRooms();
        const guestBooking = await getGuestBooking(guestId, roomNumber, bookingId);

        const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: `You are Aurelia Resort & Grand Hotel's 24/7 AI Butler Concierge. 
Available Rooms Context: ${JSON.stringify(availableRooms.map((r) => `${r.name} (Room ${r.number}, ${r.category}, $${r.price}/night)`))}
Guest Active Booking Context: ${JSON.stringify(guestBooking)}
Standard Check-Out: 11:00 AM (Late Check-Out up to 2:00 PM available).
Always maintain a high-end, hospitable, luxurious tone.`
              },
              {
                role: 'user',
                content: message
              }
            ],
            max_tokens: 250,
            temperature: 0.7
          })
        });

        if (openAiResponse.ok) {
          const aiData = await openAiResponse.json();
          const aiText = aiData.choices?.[0]?.message?.content;
          if (aiText) {
            reply = aiText;
          }
        }
      } catch (err) {
        console.warn('OpenAI API call error, falling back to controlled engine:', err.message);
      }
    }

    // Controlled Tool Rule Engine (Used if OpenAI key not configured or for deterministic action triggers)
    if (!reply) {
      // 1. "What rooms are available?"
      if (lowerMsg.includes('room') && (lowerMsg.includes('available') || lowerMsg.includes('free') || lowerMsg.includes('vacant') || lowerMsg.includes('show'))) {
        const freeRooms = await getAvailableRooms();
        if (freeRooms.length === 0) {
          reply = `Currently, all of our luxury sanctuaries are occupied. However, our reservations team can assist you with upcoming availability!`;
        } else {
          const roomList = freeRooms.map((r) => `Room ${r.number} (${r.name || r.category} - $${r.price}/night)`).join(', ');
          reply = `We currently have ${freeRooms.length} luxurious sanctuaries available: ${roomList}. Would you like me to reserve one for your stay?`;
        }
      }
      // 2. "Order room service."
      else if (lowerMsg.includes('room service') || lowerMsg.includes('food') || lowerMsg.includes('order') || lowerMsg.includes('eat') || lowerMsg.includes('dining')) {
        reply = `I would be delighted to assist with In-Room Dining! Our signature dishes include Australian Wagyu Ribeye Steak ($185), Dom Pérignon Champagne ($450), and Artisanal Truffle Omelette ($45). Please confirm your order.`;
        actionRequired = {
          type: 'ORDER_FOOD',
          confirmPrompt: `Dispatch Room Service order (Wagyu Ribeye Steak - $185) to Room ${roomNumber || '101'}?`,
          payload: {
            roomNumber: roomNumber || '101',
            item: 'Australian Wagyu Ribeye Steak',
            price: 185
          }
        };
      }
      // 3. "I need housekeeping."
      else if (lowerMsg.includes('housekeeping') || lowerMsg.includes('clean') || lowerMsg.includes('towel') || lowerMsg.includes('maid') || lowerMsg.includes('linen')) {
        reply = `Certainly! I can dispatch our Housekeeping team to your room for fresh linens, luxury towels, and room turnaround cleaning. Please confirm to send the steward.`;
        actionRequired = {
          type: 'REQUEST_HOUSEKEEPING',
          confirmPrompt: `Dispatch Housekeeping team for room turnaround to Room ${roomNumber || '101'}?`,
          payload: {
            roomNumber: roomNumber || '101',
            type: 'Guest Requested Refresh & Linens'
          }
        };
      }
      // 4. "What is my checkout time?"
      else if (lowerMsg.includes('checkout') || lowerMsg.includes('check out') || lowerMsg.includes('time')) {
        const booking = await getGuestBooking(guestId, roomNumber, bookingId);
        reply = `Standard check-out time at Aurelia Resort is 11:00 AM. Your active stay in Room ${booking.roomNumber} (${booking.roomCategory || 'Suite'}) is scheduled for check-out on ${booking.checkOut || 'August 15, 2026'}. Late check-out up to 2:00 PM is available upon request!`;
      }
      // 5. "Can I extend my stay?"
      else if (lowerMsg.includes('extend') || lowerMsg.includes('stay') || lowerMsg.includes('extra night') || lowerMsg.includes('prolong')) {
        const booking = await getGuestBooking(guestId, roomNumber, bookingId);
        reply = `I would be pleased to extend your stay in Room ${booking.roomNumber}! An additional night is available at $350/night. Please confirm if you would like me to process this 1-night extension.`;
        actionRequired = {
          type: 'EXTEND_STAY',
          confirmPrompt: `Extend your stay in Room ${booking.roomNumber} by 1 additional night for $350?`,
          payload: {
            bookingId: booking.id,
            roomNumber: booking.roomNumber,
            nights: 1,
            pricePerNight: 350
          }
        };
      }
      // 6. "Show my booking."
      else if (lowerMsg.includes('booking') || lowerMsg.includes('reservation') || lowerMsg.includes('show my') || lowerMsg.includes('my stay') || lowerMsg.includes('voucher')) {
        const booking = await getGuestBooking(guestId, roomNumber, bookingId);
        reply = `🏨 **Your Active Sanctuary Reservation Details:**\n• **Booking ID:** ${booking.id}\n• **Guest:** ${guestName || booking.guestName}\n• **Room Number:** ${booking.roomNumber} (${booking.roomCategory || 'Suite'})\n• **Dates:** ${booking.checkIn} to ${booking.checkOut}\n• **Payment Status:** ${booking.paymentStatus || 'Paid'}\n• **Total Amount:** $${booking.totalAmount}`;
      }
      // Fallback response
      else {
        reply = `Welcome to Aurelia Resort & Grand Hotel! I am your 24/7 AI Butler Concierge. How may I serve you today? You can ask me:\n- "What rooms are available?"\n- "Order room service."\n- "I need housekeeping."\n- "What is my checkout time?"\n- "Can I extend my stay?"\n- "Show my booking."`;
      }
    }

    return successResponse(res, 200, 'AI Concierge response generated', {
      reply,
      actionRequired,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('AI Controller error:', err);
    return errorResponse(res, 500, 'AI Concierge service error.');
  }
};

/**
 * @desc    Confirm & Execute Controlled Action from AI Concierge
 * @route   POST /api/ai/confirm-action
 * @access  Public / Guest
 */
export const handleConfirmAction = async (req, res) => {
  try {
    const { actionType, payload, guestName } = req.body;

    if (!actionType) {
      return errorResponse(res, 400, 'Action type is required.');
    }

    let confirmationMessage = '';
    let resultDetails = null;

    if (actionType === 'ORDER_FOOD') {
      const roomNum = payload?.roomNumber || '101';
      const item = payload?.item || 'Australian Wagyu Ribeye Steak';
      const price = payload?.price || 185;

      confirmationMessage = `🍽️ **Room Service Order Confirmed!**\nOrder for **${item}** ($${price}) has been dispatched to Room ${roomNum}. Our executive kitchen is preparing your dish.`;
      resultDetails = {
        orderId: `ORD-${Date.now().toString().slice(-4)}`,
        roomNumber: roomNum,
        item,
        status: 'Preparing'
      };
    } else if (actionType === 'REQUEST_HOUSEKEEPING') {
      const roomNum = payload?.roomNumber || '101';
      const taskId = `HK-${Date.now().toString().slice(-4)}`;

      // Update room in fallback store if needed
      const room = initialRoomsStore.find((r) => r.number === roomNum);
      if (room) room.status = 'Cleaning';

      initialHousekeepingStore.unshift({
        id: taskId,
        roomNumber: roomNum,
        type: payload?.type || 'Guest Requested Refresh',
        assignee: 'Steward Maria Garcia',
        priority: 'High',
        status: 'Pending',
        notes: 'Dispatched via AI Concierge'
      });

      confirmationMessage = `🧹 **Housekeeping Request Dispatched!**\nSteward Maria Garcia has been notified and dispatched to Room ${roomNum} with fresh linens and room sanitation.`;
      resultDetails = { taskId, roomNumber: roomNum, status: 'Pending' };
    } else if (actionType === 'EXTEND_STAY') {
      const roomNum = payload?.roomNumber || '101';
      const nights = payload?.nights || 1;
      const additionalCost = (payload?.pricePerNight || 350) * nights;

      confirmationMessage = `🏨 **Stay Extension Approved!**\nYour reservation in Room ${roomNum} has been extended by **${nights} additional night(s)**. Additional billing: **$${additionalCost}**.`;
      resultDetails = { roomNumber: roomNum, extendedNights: nights, additionalCost };
    } else {
      return errorResponse(res, 400, 'Unknown action type.');
    }

    return successResponse(res, 200, 'Action executed successfully', {
      confirmationMessage,
      resultDetails,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Confirm action error:', err);
    return errorResponse(res, 500, 'Failed to confirm action.');
  }
};
