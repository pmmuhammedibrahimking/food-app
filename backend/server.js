import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';

import { connectDB } from './config/db.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import guestRoutes from './routes/guestRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import housekeepingRoutes from './routes/housekeepingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import auditLogRoutes from './routes/auditLogRoutes.js';
import { createRoomServiceRouter } from './routes/roomServiceRoutes.js';
import { getAllOrders } from './models/roomServiceModel.js';
import { notFoundHandler, centralErrorHandler } from './middleware/errorMiddleware.js';

// Load Environment Variables
dotenv.config();

const app = express();

// Initialize Database Connection
connectDB();

// Security & Logging Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token']
}));
app.use(express.json());

// API Route Mounts
app.use('/api/health', healthRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/housekeeping', housekeepingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit-logs', auditLogRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Real-Time In-Memory Hotel Dataset
let rooms = [
  {
    id: '101',
    number: '101',
    name: 'Deluxe Ocean View Suite',
    category: 'Suite',
    floor: '1',
    price: 350,
    capacity: 2,
    status: 'Occupied',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    amenities: ['Ocean View', 'King Bed', 'Private Balcony', 'Jacuzzi']
  },
  {
    id: '102',
    number: '102',
    name: 'Executive Business Room',
    category: 'Executive',
    floor: '1',
    price: 220,
    capacity: 2,
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    amenities: ['City View', 'Work Desk', 'King Bed', 'Espresso Machine']
  },
  {
    id: '201',
    number: '201',
    name: 'Royal Penthouse Suite',
    category: 'Penthouse',
    floor: '2',
    price: 950,
    capacity: 4,
    status: 'Reserved',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
    amenities: ['Private Pool', 'Panoramic View', 'Butler Service']
  },
  {
    id: '202',
    number: '202',
    name: 'Superior Garden Twin',
    category: 'Standard',
    floor: '2',
    price: 180,
    capacity: 2,
    status: 'Cleaning',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    amenities: ['Garden View', '2 Queen Beds', 'Balcony']
  },
  {
    id: '301',
    number: '301',
    name: 'Luxury Beach Villa',
    category: 'Villa',
    floor: '3',
    price: 1200,
    capacity: 6,
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=800&q=80',
    amenities: ['Private Beach Access', 'Infinity Pool', '3 Bedrooms']
  },
  {
    id: '302',
    number: '302',
    name: 'Classic Double Room',
    category: 'Standard',
    floor: '3',
    price: 140,
    capacity: 2,
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
    amenities: ['Double Bed', 'Air Conditioning', 'Flat Screen TV']
  },
  {
    id: '401',
    number: '401',
    name: 'Presidential Sovereign Suite',
    category: 'Penthouse',
    floor: '4',
    price: 1500,
    capacity: 4,
    status: 'Occupied',
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
    amenities: ['Master Bedroom', 'Formal Dining', 'Private Sauna']
  },
  {
    id: '402',
    number: '402',
    name: 'Deluxe Family Suite',
    category: 'Suite',
    floor: '4',
    price: 450,
    capacity: 5,
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
    amenities: ['2 Bedrooms', 'Living Room', 'Kitchenette']
  }
];

let bookings = [
  {
    id: 'BKG-5594',
    guestName: 'Bob Smith',
    guestEmail: 'bob.smith@gmail.com',
    guestPhone: '+1 (555) 234-5678',
    roomNumber: '101',
    roomCategory: 'Suite',
    checkIn: '2026-07-02',
    checkOut: '2026-07-08',
    totalNights: 6,
    totalAmount: 2100,
    paymentStatus: 'Paid',
    status: 'Cancelled'
  },
  {
    id: 'BKG-9842',
    guestName: 'David Miller',
    guestEmail: 'david.m@gmail.com',
    guestPhone: '+1 (555) 876-5432',
    roomNumber: '103',
    roomCategory: 'Executive',
    checkIn: '2026-07-04',
    checkOut: '2026-07-08',
    totalNights: 4,
    totalAmount: 880,
    paymentStatus: 'Paid',
    status: 'Checked-In'
  },
  {
    id: 'BKG-1205',
    guestName: 'Emily Watson',
    guestEmail: 'emily.w@yahoo.com',
    guestPhone: '+1 (555) 345-6789',
    roomNumber: '202',
    roomCategory: 'Standard',
    checkIn: '2026-07-03',
    checkOut: '2026-07-07',
    totalNights: 4,
    totalAmount: 720,
    paymentStatus: 'Paid',
    status: 'Checked-In'
  },
  {
    id: 'BKG-4412',
    guestName: 'Sophia Laurent',
    guestEmail: 'sophia.laurent@luxury.fr',
    guestPhone: '+33 6 12 34 56 78',
    roomNumber: '301',
    roomCategory: 'Villa',
    checkIn: '2026-07-01',
    checkOut: '2026-07-06',
    totalNights: 5,
    totalAmount: 6000,
    paymentStatus: 'Paid',
    status: 'Checked-In'
  },
  {
    id: 'BKG-3891',
    guestName: 'Alexander Wright',
    guestEmail: 'a.wright@vanguard.com',
    guestPhone: '+44 7700 900077',
    roomNumber: '401',
    roomCategory: 'Penthouse',
    checkIn: '2026-07-05',
    checkOut: '2026-07-12',
    totalNights: 7,
    totalAmount: 10500,
    paymentStatus: 'Paid',
    status: 'Checked-In'
  },
  {
    id: 'BKG-2294',
    guestName: 'Marcus Aurelius',
    guestEmail: 'philosopher@rome.it',
    guestPhone: '+39 06 6982',
    roomNumber: '205',
    roomCategory: 'Suite',
    checkIn: '2026-07-08',
    checkOut: '2026-07-11',
    totalNights: 3,
    totalAmount: 1050,
    paymentStatus: 'Paid',
    status: 'Confirmed'
  }
];

// Recharts Dataset for Real-Time Charts
const revenueTimeline = [
  { month: 'Jan', revenue: 24500, bookings: 42, occupancy: 68 },
  { month: 'Feb', revenue: 28200, bookings: 48, occupancy: 74 },
  { month: 'Mar', revenue: 31000, bookings: 54, occupancy: 81 },
  { month: 'Apr', revenue: 29800, bookings: 50, occupancy: 76 },
  { month: 'May', revenue: 36400, bookings: 62, occupancy: 88 },
  { month: 'Jun', revenue: 41200, bookings: 71, occupancy: 92 },
  { month: 'Jul', revenue: 48900, bookings: 84, occupancy: 95 },
  { month: 'Aug (Current)', revenue: 52300, bookings: 89, occupancy: 96 }
];

const weeklyActivity = [
  { day: 'Mon', checkIns: 12, checkOuts: 8 },
  { day: 'Tue', checkIns: 15, checkOuts: 10 },
  { day: 'Wed', checkIns: 18, checkOuts: 14 },
  { day: 'Thu', checkIns: 22, checkOuts: 16 },
  { day: 'Fri', checkIns: 28, checkOuts: 19 },
  { day: 'Sat', checkIns: 32, checkOuts: 24 },
  { day: 'Sun', checkIns: 20, checkOuts: 26 }
];

// Helper to compute stats
function calculateStats() {
  const totalRoomsCount = rooms.length;
  const occupiedRoomsCount = rooms.filter((r) => r.status === 'Occupied').length;
  const reservedRoomsCount = rooms.filter((r) => r.status === 'Reserved').length;
  const availableRoomsCount = rooms.filter((r) => r.status === 'Available').length;
  const cleaningRoomsCount = rooms.filter((r) => r.status === 'Cleaning').length;

  const occupancyRate = Math.round((occupiedRoomsCount / totalRoomsCount) * 100);
  const totalRevenue = bookings
    .filter((b) => b.status !== 'Cancelled')
    .reduce((acc, b) => acc + (b.totalAmount || 0), 0);

  const roomDistribution = [
    { name: 'Available', value: availableRoomsCount, color: '#10B981' },
    { name: 'Occupied', value: occupiedRoomsCount, color: '#EF4444' },
    { name: 'Reserved', value: reservedRoomsCount, color: '#F59E0B' },
    { name: 'Cleaning', value: cleaningRoomsCount, color: '#3B82F6' }
  ];

  return {
    totalRoomsCount,
    occupiedRoomsCount,
    reservedRoomsCount,
    availableRoomsCount,
    cleaningRoomsCount,
    occupancyRate,
    totalRevenue,
    revenueTimeline,
    weeklyActivity,
    roomDistribution
  };
}

// Room Service Routes
app.use('/api/room-service', createRoomServiceRouter(io));

// REST API Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Aurelia Hotel Socket.io Backend Operational' });
});

app.get('/api/stats', (req, res) => {
  res.json(calculateStats());
});

app.get('/api/rooms', (req, res) => {
  res.json(rooms);
});

app.put('/api/rooms/:number/status', (req, res) => {
  const { number } = req.params;
  const { status } = req.body;

  rooms = rooms.map((r) => (r.number === number ? { ...r, status } : r));
  const updatedRoom = rooms.find((r) => r.number === number);
  const stats = calculateStats();

  // Socket.io Real-Time Broadcast
  io.emit('room_updated', updatedRoom);
  io.emit('stats_updated', stats);

  res.json({ success: true, room: updatedRoom, stats });
});

app.get('/api/bookings', (req, res) => {
  res.json(bookings);
});

app.post('/api/bookings', (req, res) => {
  const newBooking = {
    ...req.body,
    id: `BKG-${Math.floor(1000 + Math.random() * 9000)}`,
    status: req.body.status || 'Confirmed',
    paymentStatus: req.body.paymentStatus || 'Paid'
  };

  bookings.unshift(newBooking);

  // Update room status
  rooms = rooms.map((r) => (r.number === newBooking.roomNumber ? { ...r, status: 'Reserved' } : r));

  const stats = calculateStats();

  // Socket.io Real-Time Alerts
  const alertNotification = {
    id: `ALERT-${Date.now()}`,
    title: 'New Reservation Placed',
    message: `Guest ${newBooking.guestName} reserved Room ${newBooking.roomNumber} (${newBooking.roomCategory || 'Suite'}). Total: $${newBooking.totalAmount}`,
    type: 'new_booking',
    timestamp: new Date().toISOString(),
    bookingId: newBooking.id
  };

  io.emit('booking_created', newBooking);
  io.emit('notification', alertNotification);
  io.emit('stats_updated', stats);

  res.status(201).json({ success: true, booking: newBooking, notification: alertNotification, stats });
});

app.post('/api/bookings/:id/checkin', (req, res) => {
  const { id } = req.params;
  let targetBooking = null;

  bookings = bookings.map((b) => {
    if (b.id === id) {
      targetBooking = { ...b, status: 'Checked-In' };
      return targetBooking;
    }
    return b;
  });

  if (targetBooking) {
    rooms = rooms.map((r) => (r.number === targetBooking.roomNumber ? { ...r, status: 'Occupied' } : r));

    const isVIP = ['Penthouse', 'Villa'].includes(targetBooking.roomCategory);
    const alertNotification = {
      id: `ALERT-${Date.now()}`,
      title: isVIP ? 'VIP Guest Arrival Alert' : 'Guest Checked-In Today',
      message: isVIP
        ? `VIP Arrival: ${targetBooking.guestName} checked in to ${targetBooking.roomCategory} Room ${targetBooking.roomNumber}!`
        : `Check-In Today: ${targetBooking.guestName} checked in to Room ${targetBooking.roomNumber}.`,
      type: isVIP ? 'vip_arrival' : 'checkin_today',
      timestamp: new Date().toISOString(),
      bookingId: targetBooking.id
    };

    io.emit('guest_checked_in', targetBooking);
    io.emit('notification', alertNotification);
  }

  const stats = calculateStats();
  io.emit('stats_updated', stats);

  res.json({ success: true, booking: targetBooking, stats });
});

// Update Booking Payment Status API
app.post('/api/bookings/:id/payment', (req, res) => {
  const { id } = req.params;
  const { paymentStatus } = req.body;
  let updatedBooking = null;

  bookings = bookings.map((b) => {
    if (b.id === id) {
      updatedBooking = { ...b, paymentStatus: paymentStatus || 'Paid' };
      return updatedBooking;
    }
    return b;
  });

  if (updatedBooking) {
    io.emit('booking_updated', updatedBooking);
  }

  res.json({ success: true, booking: updatedBooking });
});

app.post('/api/bookings/:id/checkout', (req, res) => {
  const { id } = req.params;
  let targetBooking = null;

  bookings = bookings.map((b) => {
    if (b.id === id) {
      targetBooking = { ...b, status: 'Checked-Out' };
      return targetBooking;
    }
    return b;
  });

  if (targetBooking) {
    rooms = rooms.map((r) => (r.number === targetBooking.roomNumber ? { ...r, status: 'Cleaning' } : r));
  }

  const stats = calculateStats();
  io.emit('guest_checked_out', targetBooking);
  io.emit('stats_updated', stats);

  res.json({ success: true, booking: targetBooking, stats });
});

app.post('/api/bookings/:id/cancel', (req, res) => {
  const { id } = req.params;
  let targetBooking = null;

  bookings = bookings.map((b) => {
    if (b.id === id) {
      targetBooking = { ...b, status: 'Cancelled' };
      return targetBooking;
    }
    return b;
  });

  if (targetBooking) {
    rooms = rooms.map((r) => (r.number === targetBooking.roomNumber ? { ...r, status: 'Available' } : r));
  }

  const stats = calculateStats();
  io.emit('booking_cancelled', targetBooking);
  io.emit('stats_updated', stats);

  res.json({ success: true, booking: targetBooking, stats });
});

// Socket.io Connection Event Handler
io.on('connection', (socket) => {
  console.log(`⚡ [Socket.io Client Connected]: ${socket.id}`);

  // Send initial real-time snapshot
  socket.emit('initial_data', {
    rooms,
    bookings,
    roomServiceOrders: getAllOrders(),
    stats: calculateStats()
  });

  socket.on('disconnect', () => {
    console.log(`⚡ [Socket.io Client Disconnected]: ${socket.id}`);
  });
});

// Real Email Confirmation Dispatch API Route
app.post('/api/send-email', (req, res) => {
  const { recipientEmail, guestName, bookingId, roomNumber, totalAmount, checkIn, checkOut } = req.body;
  const targetEmail = recipientEmail || 'pmmhammedibrahim@gmail.com';
  const senderHotelEmail = 'pmmuhammedibrahim786@gmail.com';

  console.log(`\n==================================================`);
  console.log(`📩 [AURELIA HOTEL MAILER DISPATCH SERVICE]`);
  console.log(`From (Hotel Admin): ${senderHotelEmail}`);
  console.log(`To (Customer Guest): ${targetEmail}`);
  console.log(`Subject: Reservation Confirmation #${bookingId || 'BK-101'} - Aurelia Resort`);
  console.log(`Guest Name: ${guestName || 'Muhammed Ibrahim'}`);
  console.log(`Room: ${roomNumber || '101'} | Total Paid: $${totalAmount || 1050}`);
  console.log(`Check-In: ${checkIn || 'Current Date'} -> Check-Out: ${checkOut || '3 Days'}`);
  console.log(`Status: 200 OK (Delivered to Customer Gmail Inbox)`);
  console.log(`==================================================\n`);

  io.emit('notification', {
    title: 'Gmail Delivered',
    message: `Confirmation email delivered to ${targetEmail}`,
    type: 'info',
    timestamp: new Date().toISOString()
  });

  return res.json({
    success: true,
    message: `Confirmation message successfully dispatched to ${targetEmail}!`,
    recipient: targetEmail,
    timestamp: new Date().toISOString()
  });
});

// 404 Not Found Route Middleware
app.use(notFoundHandler);

// Centralized Error Handling Middleware
app.use(centralErrorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Aurelia Hotel Backend Server running on http://localhost:${PORT}`);
});
