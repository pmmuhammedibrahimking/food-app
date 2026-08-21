import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  id: { type: String, default: () => `NOTE-${Date.now()}` },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  text: { type: String, required: true },
  author: { type: String, default: 'Concierge Desk' }
});

const guestSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: [true, 'Please provide guest full name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide guest email address'],
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      default: 'N/A'
    },
    address: {
      type: String,
      default: 'Royal Suite Residence'
    },
    vipStatus: {
      type: String,
      enum: ['Diamond', 'Gold', 'Silver', 'Standard'],
      default: 'Standard'
    },
    frequentGuestStatus: {
      type: Boolean,
      default: false
    },
    stays: {
      type: Number,
      default: 1
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    tags: {
      type: [String],
      default: ['VIP']
    },
    foodPreferences: {
      type: String,
      default: 'Fresh espresso, Organic gluten-free options'
    },
    roomPreferences: {
      type: String,
      default: 'High floor penthouse, Quiet wing'
    },
    preferences: {
      type: String,
      default: 'High floor, Dom Pérignon on arrival'
    },
    notes: [noteSchema]
  },
  {
    timestamps: true
  }
);

export const Guest = mongoose.model('Guest', guestSchema);

// In-Memory Fallback Seed Guests Dataset
export let initialGuestsStore = [
  {
    id: 'G-101',
    name: 'Lord Alexander Wright',
    email: 'alexander.wright@royals.co.uk',
    phone: '+44 7911 123456',
    address: '10 Kensington Palace Gardens, London, UK',
    vipStatus: 'Diamond',
    frequentGuestStatus: true,
    stays: 12,
    totalSpent: 42500,
    tags: ['VIP', 'Frequent'],
    foodPreferences: 'Dom Pérignon on arrival, Caviar Omelette, Organic Gluten-free',
    roomPreferences: 'High Floor Penthouse, Quiet Wing, Jacuzzi Suite',
    preferences: 'High floor, Dom Pérignon on arrival, Late Check-out',
    notes: [
      { id: 'n1', date: '2026-08-01', text: 'Requested extra goose feather pillows and late 3 PM check-out.', author: 'Concierge Manager' },
      { id: 'n2', date: '2026-07-15', text: 'Celebrated 10th anniversary — complimentary Champagne sent by GM.', author: 'VIP Butler Service' }
    ]
  },
  {
    id: 'G-102',
    name: 'Sophia Loren',
    email: 'sophia.loren@cinema.it',
    phone: '+39 06 698765',
    address: 'Via Condotti 45, Rome, Italy',
    vipStatus: 'Gold',
    frequentGuestStatus: true,
    stays: 6,
    totalSpent: 12800,
    tags: ['VIP'],
    foodPreferences: 'Pinot Noir Wine, Vegan Pastas, Fresh Espresso',
    roomPreferences: 'Ocean View Balcony, King Bed, Top Floor',
    preferences: 'Ocean view balcony, Feather pillows, Gluten-free menu',
    notes: [
      { id: 'n3', date: '2026-08-02', text: 'Prefers quiet corner suite away from elevator shaft.', author: 'Front Desk Staff' }
    ]
  },
  {
    id: 'G-103',
    name: 'Marcus Vance',
    email: 'marcus.vance@techcorp.com',
    phone: '+1 415 555 0199',
    address: '500 Howard Street, San Francisco, CA',
    vipStatus: 'Silver',
    frequentGuestStatus: true,
    stays: 4,
    totalSpent: 7400,
    tags: ['Frequent'],
    foodPreferences: 'Black Coffee, High-protein breakfast, Sparkling water',
    roomPreferences: 'Executive Business Desk, High Speed Wi-Fi, Quiet Wing',
    preferences: 'Quiet wing, Morning espresso delivery, Workstation',
    notes: [
      { id: 'n4', date: '2026-08-03', text: 'Requested dual monitors for suite workstation.', author: 'IT Support Team' }
    ]
  },
  {
    id: 'G-104',
    name: 'Elena Rostova',
    email: 'elena.rostova@design.de',
    phone: '+49 30 123456',
    address: 'Kurfürstendamm 190, Berlin, Germany',
    vipStatus: 'Standard',
    frequentGuestStatus: false,
    stays: 2,
    totalSpent: 1800,
    tags: ['Risk'],
    foodPreferences: 'Severe Peanut & Nut Allergy (Strict kitchen protocol)',
    roomPreferences: 'Non-smoking room, Low floor elevator accessible',
    preferences: 'Non-smoking room, Airport pickup shuttle',
    notes: [
      { id: 'n5', date: '2026-07-28', text: 'Risk Note: Disputed mini-bar charges on last departure. Verify bill at check-in.', author: 'Finance Manager' }
    ]
  }
];
