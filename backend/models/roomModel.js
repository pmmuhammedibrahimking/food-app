import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      required: [true, 'Please provide room number'],
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Please provide room title / name'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Please specify room category'],
      enum: ['Suite', 'Executive', 'Penthouse', 'Standard', 'Villa'],
      default: 'Suite'
    },
    description: {
      type: String,
      default: 'Luxurious resort room equipped with modern amenities and high-speed Wi-Fi.'
    },
    price: {
      type: Number,
      required: [true, 'Please provide price per night'],
      min: 0
    },
    floor: {
      type: String,
      default: '1'
    },
    capacity: {
      type: Number,
      default: 2
    },
    amenities: {
      type: [String],
      default: ['King Bed', 'Free Wi-Fi', 'Air Conditioning', 'Flat Screen TV']
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
    },
    status: {
      type: String,
      enum: ['Available', 'Reserved', 'Occupied', 'Cleaning', 'Maintenance'],
      default: 'Available'
    }
  },
  {
    timestamps: true
  }
);

export const Room = mongoose.model('Room', roomSchema);

// In-Memory Fallback Seed Rooms Dataset
export let initialRoomsStore = [
  {
    id: '101',
    number: '101',
    name: 'Deluxe Ocean View Suite',
    category: 'Suite',
    description: 'Breathtaking ocean views with private balcony, king bed, and jacuzzi suite.',
    floor: '1',
    price: 350,
    capacity: 2,
    status: 'Occupied',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    amenities: ['Ocean View', 'King Bed', 'Private Balcony', 'Jacuzzi', 'Free Wi-Fi', 'Mini Bar']
  },
  {
    id: '102',
    number: '102',
    name: 'Executive Business Room',
    category: 'Executive',
    description: 'Designed for elite business travelers with high-speed internet and workstation.',
    floor: '1',
    price: 220,
    capacity: 2,
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    amenities: ['City View', 'Work Desk', 'King Bed', 'Espresso Machine', 'High-Speed Wi-Fi']
  },
  {
    id: '201',
    number: '201',
    name: 'Royal Penthouse Suite',
    category: 'Penthouse',
    description: 'Ultra-luxurious top-floor penthouse with private infinity pool and butler service.',
    floor: '2',
    price: 950,
    capacity: 4,
    status: 'Reserved',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
    amenities: ['Private Pool', 'Panoramic View', 'Butler Service', 'Spa Tub', 'Terrace', 'VIP Lounge Access']
  },
  {
    id: '202',
    number: '202',
    name: 'Superior Garden Twin',
    category: 'Standard',
    description: 'Quiet room looking over lush botanical gardens with dual queen beds.',
    floor: '2',
    price: 180,
    capacity: 2,
    status: 'Cleaning',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    amenities: ['Garden View', '2 Queen Beds', 'Balcony', 'Free Wi-Fi', 'Smart TV']
  },
  {
    id: '301',
    number: '301',
    name: 'Luxury Beach Villa',
    category: 'Villa',
    description: 'Stand-alone beachfront villa with direct private sand access and infinity pool.',
    floor: '3',
    price: 1200,
    capacity: 6,
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=800&q=80',
    amenities: ['Private Beach Access', 'Infinity Pool', '3 Bedrooms', 'Kitchenette', 'Private Garden']
  },
  {
    id: '302',
    number: '302',
    name: 'Classic Double Room',
    category: 'Standard',
    description: 'Cozy and elegant double room suitable for short luxury stays.',
    floor: '3',
    price: 140,
    capacity: 2,
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
    amenities: ['Double Bed', 'Air Conditioning', 'Flat Screen TV', 'Free Wi-Fi']
  },
  {
    id: '401',
    number: '401',
    name: 'Presidential Sovereign Suite',
    category: 'Penthouse',
    description: 'The pinnacle of Aurelia hospitality with formal dining hall and sauna.',
    floor: '4',
    price: 1500,
    capacity: 4,
    status: 'Occupied',
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
    amenities: ['Master Bedroom', 'Formal Dining', 'Private Sauna', 'Helipad Access', '24/7 Security']
  }
];
