import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    guestId: {
      type: String,
      default: 'G-101'
    },
    guestName: {
      type: String,
      required: [true, 'Please provide guest name'],
      trim: true
    },
    guestEmail: {
      type: String,
      required: [true, 'Please provide guest email address'],
      lowercase: true,
      trim: true
    },
    guestPhone: {
      type: String,
      default: '+1 (555) 000-0000'
    },
    roomNumber: {
      type: String,
      required: [true, 'Please select room number'],
      trim: true
    },
    roomCategory: {
      type: String,
      default: 'Suite'
    },
    checkIn: {
      type: String,
      required: [true, 'Please specify check-in date (YYYY-MM-DD)']
    },
    checkOut: {
      type: String,
      required: [true, 'Please specify check-out date (YYYY-MM-DD)']
    },
    guestsCount: {
      type: Number,
      default: 2
    },
    roomPrice: {
      type: Number,
      default: 350
    },
    taxes: {
      type: Number,
      default: 35
    },
    discount: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Partial', 'Paid', 'Refunded'],
      default: 'Paid'
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Checked-In', 'Checked-Out', 'Cancelled'],
      default: 'Confirmed'
    },
    checkInTimestamp: {
      type: String,
      default: null
    },
    checkOutTimestamp: {
      type: String,
      default: null
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

export const Booking = mongoose.model('Booking', bookingSchema);

// In-Memory Fallback Dataset
export let initialBookingsStore = [
  {
    id: 'BKG-5594',
    guestId: 'G-104',
    guestName: 'Bob Smith',
    guestEmail: 'bob.smith@gmail.com',
    guestPhone: '+1 (555) 234-5678',
    roomNumber: '101',
    roomCategory: 'Suite',
    checkIn: '2026-08-02',
    checkOut: '2026-08-08',
    guestsCount: 2,
    roomPrice: 350,
    taxes: 210,
    discount: 0,
    totalNights: 6,
    totalAmount: 2310,
    paymentStatus: 'Paid',
    status: 'Cancelled'
  },
  {
    id: 'BKG-9842',
    guestId: 'G-103',
    guestName: 'Marcus Vance',
    guestEmail: 'marcus.vance@techcorp.com',
    guestPhone: '+1 415 555 0199',
    roomNumber: '102',
    roomCategory: 'Executive',
    checkIn: '2026-08-10',
    checkOut: '2026-08-15',
    guestsCount: 2,
    roomPrice: 220,
    taxes: 110,
    discount: 0,
    totalNights: 5,
    totalAmount: 1210,
    paymentStatus: 'Paid',
    status: 'Checked-In',
    checkInTimestamp: '2026-08-10T14:30:00.000Z'
  },
  {
    id: 'BKG-1205',
    guestId: 'G-102',
    guestName: 'Sophia Loren',
    guestEmail: 'sophia.loren@cinema.it',
    guestPhone: '+39 06 698765',
    roomNumber: '202',
    roomCategory: 'Standard',
    checkIn: '2026-08-11',
    checkOut: '2026-08-16',
    guestsCount: 2,
    roomPrice: 180,
    taxes: 90,
    discount: 0,
    totalNights: 5,
    totalAmount: 990,
    paymentStatus: 'Paid',
    status: 'Checked-In',
    checkInTimestamp: '2026-08-11T12:00:00.000Z'
  },
  {
    id: 'BKG-3891',
    guestId: 'G-101',
    guestName: 'Lord Alexander Wright',
    guestEmail: 'alexander.wright@royals.co.uk',
    guestPhone: '+44 7911 123456',
    roomNumber: '201',
    roomCategory: 'Penthouse',
    checkIn: '2026-08-12',
    checkOut: '2026-08-20',
    guestsCount: 4,
    roomPrice: 950,
    taxes: 760,
    discount: 100,
    totalNights: 8,
    totalAmount: 8260,
    paymentStatus: 'Paid',
    status: 'Confirmed'
  },
  {
    id: 'BKG-4412',
    guestId: 'G-105',
    guestName: 'Sophia Laurent',
    guestEmail: 'sophia.laurent@luxury.fr',
    guestPhone: '+33 6 12 34 56 78',
    roomNumber: '301',
    roomCategory: 'Villa',
    checkIn: '2026-08-14',
    checkOut: '2026-08-21',
    guestsCount: 4,
    roomPrice: 1200,
    taxes: 840,
    discount: 200,
    totalNights: 7,
    totalAmount: 9040,
    paymentStatus: 'Paid',
    status: 'Confirmed'
  }
];
