import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/apiClient.js';

const HotelContext = createContext();

const initialRooms = [
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
    amenities: ['Ocean View', 'King Bed', 'Private Balcony', 'Jacuzzi', 'Free Wi-Fi', 'Mini Bar']
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
    amenities: ['City View', 'Work Desk', 'King Bed', 'Espresso Machine', 'High-Speed Wi-Fi']
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
    amenities: ['Private Pool', 'Panoramic View', 'Butler Service', 'Spa Tub', 'Terrace', 'VIP Lounge Access']
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
    amenities: ['Garden View', '2 Queen Beds', 'Balcony', 'Free Wi-Fi', 'Smart TV']
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
    amenities: ['Private Beach Access', 'Infinity Pool', '3 Bedrooms', 'Kitchenette', 'Private Garden']
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
    amenities: ['Double Bed', 'Air Conditioning', 'Flat Screen TV', 'Free Wi-Fi']
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
    amenities: ['Master Bedroom', 'Formal Dining', 'Private Sauna', 'Helipad Access', '24/7 Security']
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
    amenities: ['2 Bedrooms', 'Living Room', 'Kitchenette', 'Kid Zone', 'Ocean View']
  }
];

const initialBookings = [
  {
    id: 'BK-7860',
    guestName: 'Muhammed Ibrahim',
    guestEmail: 'pmmuhammedibrahim786@gmail.com',
    guestPhone: '+1 (555) 786-0199',
    roomNumber: '401',
    roomCategory: 'Penthouse',
    checkIn: '2026-08-20',
    checkOut: '2026-08-28',
    totalNights: 8,
    totalAmount: 12000,
    paymentStatus: 'Paid',
    status: 'Checked-In',
    createdAt: '2026-08-15'
  },
  {
    id: 'BK-9021',
    guestName: 'Lord Alexander Wright',
    guestEmail: 'alexander.wright@royals.co.uk',
    guestPhone: '+44 7911 123456',
    roomNumber: '401',
    roomCategory: 'Penthouse',
    checkIn: '2026-08-05',
    checkOut: '2026-08-12',
    totalNights: 7,
    totalAmount: 10500,
    paymentStatus: 'Paid',
    status: 'Checked-In',
    createdAt: '2026-07-28'
  },
  {
    id: 'BK-8842',
    guestName: 'Sophia Loren',
    guestEmail: 'sophia.loren@cinema.it',
    guestPhone: '+39 06 698765',
    roomNumber: '101',
    roomCategory: 'Suite',
    checkIn: '2026-08-07',
    checkOut: '2026-08-10',
    totalNights: 3,
    totalAmount: 1050,
    paymentStatus: 'Paid',
    status: 'Checked-In',
    createdAt: '2026-08-01'
  },
  {
    id: 'BK-7731',
    guestName: 'Marcus Vance',
    guestEmail: 'marcus.vance@techcorp.com',
    guestPhone: '+1 415 555 0199',
    roomNumber: '201',
    roomCategory: 'Penthouse',
    checkIn: '2026-08-10',
    checkOut: '2026-08-14',
    totalNights: 4,
    totalAmount: 3800,
    paymentStatus: 'Paid',
    status: 'Confirmed',
    createdAt: '2026-08-03'
  },
  {
    id: 'BK-6102',
    guestName: 'Elena Rostova',
    guestEmail: 'elena.rostova@design.de',
    guestPhone: '+49 30 123456',
    roomNumber: '202',
    roomCategory: 'Standard',
    checkIn: '2026-08-02',
    checkOut: '2026-08-07',
    totalNights: 5,
    totalAmount: 900,
    paymentStatus: 'Paid',
    status: 'Checked-Out',
    createdAt: '2026-07-25'
  },
  {
    id: 'BK-5519',
    guestName: 'James Sterling',
    guestEmail: 'j.sterling@finance.org',
    guestPhone: '+1 212 555 0144',
    roomNumber: '301',
    roomCategory: 'Villa',
    checkIn: '2026-08-15',
    checkOut: '2026-08-20',
    totalNights: 5,
    totalAmount: 6000,
    paymentStatus: 'Pending',
    status: 'Confirmed',
    createdAt: '2026-08-06'
  }
];

const initialGuests = [
  {
    id: 'G-100',
    name: 'Muhammed Ibrahim',
    email: 'pmmuhammedibrahim786@gmail.com',
    phone: '+1 (555) 786-0199',
    vipStatus: 'Diamond',
    stays: 15,
    totalSpent: 58000,
    tags: ['Google Verified', 'VIP Elite', 'Owner Profile'],
    foodPreferences: 'Vintage Dom Pérignon Champagne, Wagyu Steak, Fresh Espresso',
    roomPreferences: 'Presidential Sovereign Suite 401, Private Balcony, High Floor',
    preferences: 'Ocean view balcony, Dom Pérignon on arrival, Late Check-out',
    notes: [
      { id: 'n0', date: '2026-08-20', text: 'VIP Guest logged in via Google Account. Priority 24/7 Butler Service assigned.', author: 'Google Identity Service' }
    ]
  },
  {
    id: 'G-101',
    name: 'Lord Alexander Wright',
    email: 'alexander.wright@royals.co.uk',
    phone: '+44 7911 123456',
    vipStatus: 'Diamond',
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
    vipStatus: 'Gold',
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
    vipStatus: 'Silver',
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
    vipStatus: 'Standard',
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

const initialHousekeeping = [
  { id: 'HK-1', roomNumber: '202', type: 'Full Departure Clean', assignee: 'Maria Garcia', priority: 'High', status: 'Cleaning' },
  { id: 'HK-2', roomNumber: '102', type: 'Daily Refresh', assignee: 'John Doe', priority: 'Normal', status: 'Completed' },
  { id: 'HK-3', roomNumber: '302', type: 'Sanitation Check', assignee: 'Carlos Ruiz', priority: 'Low', status: 'Pending' },
  { id: 'HK-4', roomNumber: '301', type: 'VIP Welcome Prep', assignee: 'Maria Garcia', priority: 'Urgent', status: 'Pending' }
];

const initialDiningMenu = [
  {
    id: 'M-101',
    name: 'Artisanal Truffle & Caviar Omelette',
    category: 'Breakfast',
    price: 45,
    description: 'Organic free-range eggs, fresh French black truffle, Sevruga caviar, and toasted brioche.',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
    tags: ['Chef Special', 'Gluten-Free Option']
  },
  {
    id: 'M-108',
    name: 'Royal Eggs Benedict & Norwegian Salmon',
    category: 'Breakfast',
    price: 38,
    description: 'Poached organic eggs, house-cured salmon, yuzu hollandaise on toasted English muffin.',
    image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=800&q=80',
    tags: ['Breakfast', 'Popular']
  },
  {
    id: 'M-109',
    name: 'Fluffy Japanese Soufflé Pancakes',
    category: 'Breakfast',
    price: 28,
    description: 'Ultra-fluffy soufflé stack, organic maple syrup, whipped mascarpone, and fresh berries.',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80',
    tags: ['Sweet', 'Chef Favorite']
  },
  {
    id: 'M-110',
    name: 'Artisanal Brioche French Toast',
    category: 'Breakfast',
    price: 26,
    description: 'Vanilla bean custard brioche, caramelised banana, pecans, and Madagascar vanilla cream.',
    image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=800&q=80',
    tags: ['Breakfast']
  },
  {
    id: 'M-102',
    name: 'Australian Wagyu Ribeye Steak (300g)',
    category: 'Fine Dining',
    price: 98,
    description: 'MBS 8+ Wagyu ribeye, smoked bone marrow butter, roasted garlic puree, and truffle jus.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    tags: ['Best Seller', 'Signature']
  },
  {
    id: 'M-103',
    name: 'Wild Chilean Sea Bass Saffron Risotto',
    category: 'Fine Dining',
    price: 82,
    description: 'Pan-seared Chilean sea bass over Carnaroli saffron risotto and crispy capers.',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
    tags: ['Seafood', 'Gluten-Free']
  },
  {
    id: 'M-111',
    name: 'Grilled Rack of New Zealand Lamb',
    category: 'Fine Dining',
    price: 76,
    description: 'Herb-crusted lamb rack, mint infused pea mousseline, and rosemary port wine reduction.',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    tags: ['Fine Dining']
  },
  {
    id: 'M-112',
    name: 'Crispy Skin Duck Breast & Cherry Port',
    category: 'Fine Dining',
    price: 64,
    description: 'Pan-roasted duck breast, parsnip silk puree, braised endive, and bing cherry reduction.',
    image: 'https://images.unsplash.com/photo-1514944288352-fffac99f0bdf?auto=format&fit=crop&w=800&q=80',
    tags: ['Gourmet']
  },
  {
    id: 'M-113',
    name: 'Pan-Seared King Salmon & Asparagus',
    category: 'Main Course',
    price: 58,
    description: 'Wild Alaskan salmon, char-grilled jumbo asparagus, and lemon chervil beurre blanc.',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80',
    tags: ['Seafood', 'Healthy']
  },
  {
    id: 'M-105',
    name: 'Maine Lobster Black Truffle Tagliolini',
    category: 'Main Course',
    price: 68,
    description: 'Hand-cut pasta, fresh Maine lobster tail, butter poached cherry tomatoes, and summer truffle.',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
    tags: ['Chef Special']
  },
  {
    id: 'M-114',
    name: 'Imperial Sevruga Caviar Platter (30g)',
    category: 'Fine Dining',
    price: 180,
    description: '30g Sevruga caviar served with warm blinis, creme fraiche, chopped egg, and chives.',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
    tags: ['VIP Luxury', 'Caviar']
  },
  {
    id: 'M-115',
    name: 'Hokkaido Scallop Yuzu Carpaccio',
    category: 'Fine Dining',
    price: 42,
    description: 'Thinly sliced raw Japanese scallops, yuzu vinaigrette, pink peppercorns, and micro coriander.',
    image: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?auto=format&fit=crop&w=800&q=80',
    tags: ['Starter', 'Raw Bar']
  },
  {
    id: 'M-116',
    name: 'Jamón Ibérico de Bellota 100% (Grand Reserve)',
    category: 'Fine Dining',
    price: 55,
    description: 'Aged 48 months acorn-fed Spanish Iberico ham, served with tomato crystal bread.',
    image: 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=800&q=80',
    tags: ['Charcuterie']
  },
  {
    id: 'M-117',
    name: 'Fresh Burrata Di Bufala & Heirloom Tomato',
    category: 'Fine Dining',
    price: 32,
    description: 'Creamy Italian burrata, heirloom tomatoes, 25-year aged balsamic, and basil pesto.',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    tags: ['Vegetarian']
  },
  {
    id: 'M-104',
    name: 'Vintage Dom Pérignon Champagne 2012',
    category: 'Beverages & Wine',
    price: 420,
    description: '750ml bottle served chilled in silver ice bucket with crystal flutes.',
    image: 'https://images.unsplash.com/photo-1569919659476-f0852f6834b7?auto=format&fit=crop&w=800&q=80',
    tags: ['Vintage Wine', 'Luxury']
  },
  {
    id: 'M-118',
    name: 'Château Margaux Premier Grand Cru 2015',
    category: 'Beverages & Wine',
    price: 850,
    description: 'Iconic Bordeaux red wine, decanted at room temperature with sommelier service.',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
    tags: ['Bordeaux', 'Collector']
  },
  {
    id: 'M-119',
    name: 'Smoked 24K Gold Bourbon Old Fashioned',
    category: 'Beverages & Wine',
    price: 35,
    description: 'Single barrel bourbon, applewood smoke, Angostura bitters, garnished with 24K gold leaf.',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
    tags: ['Cocktail', 'Signature']
  },
  {
    id: 'M-120',
    name: 'Fresh Coconut & Dragonfruit Elixir',
    category: 'Beverages & Wine',
    price: 18,
    description: 'Chilled young king coconut water infused with organic dragonfruit and mint.',
    image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&q=80',
    tags: ['Non-Alcoholic', 'Refreshment']
  },
  {
    id: 'M-121',
    name: 'Ethiopian Blue Mountain Single Origin Espresso',
    category: 'Beverages & Wine',
    price: 14,
    description: 'Artisanal double espresso shot served with dark chocolate truffles.',
    image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=800&q=80',
    tags: ['Coffee']
  },
  {
    id: 'M-106',
    name: 'Organic Acai Dragonfruit Superfood Bowl',
    category: 'Spa & Wellness',
    price: 24,
    description: 'Pure Amazonian acai blend, dragonfruit, coconut flakes, chia seeds, and raw honey.',
    image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=80',
    tags: ['Vegan', 'Healthy']
  },
  {
    id: 'M-122',
    name: 'Wild Quinoa & Roasted Avocado Buddha Bowl',
    category: 'Spa & Wellness',
    price: 26,
    description: 'Tri-color quinoa, grilled avocado, edamame, kale, pomegranates, and tahini dressing.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    tags: ['Vegan', 'Gluten-Free']
  },
  {
    id: 'M-123',
    name: 'Cold-Pressed Green Goddess Detox Juice',
    category: 'Spa & Wellness',
    price: 16,
    description: 'Celery, green apple, cucumber, kale, ginger, and lemon cold-pressed daily.',
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80',
    tags: ['Detox', 'Juice']
  },
  {
    id: 'M-107',
    name: 'Warm Valrhona Chocolate Lava Soufflé',
    category: 'Desserts',
    price: 28,
    description: 'Molten dark 70% chocolate center served with Madagascar bourbon vanilla bean gelato.',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    tags: ['Dessert']
  },
  {
    id: 'M-124',
    name: 'Sicilian Pistachio Tiramisu',
    category: 'Desserts',
    price: 22,
    description: 'Bronte pistachio cream, espresso soaked savoiardi biscuits, and crushed pistachios.',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
    tags: ['Dessert', 'Italian']
  },
  {
    id: 'M-125',
    name: 'Exotic Passion Fruit & Mango Pavlova',
    category: 'Desserts',
    price: 24,
    description: 'Crisp meringue shell, passion fruit curd, fresh mango roses, and chantilly cream.',
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80',
    tags: ['Dessert']
  },
  {
    id: 'M-126',
    name: 'Handcrafted French Macaron & Truffle Tasting Box',
    category: 'Desserts',
    price: 32,
    description: 'Selection of 6 Parisian macarons and 4 dark chocolate ganache truffles.',
    image: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=800&q=80',
    tags: ['Gift Box', 'Sweets']
  }
];

const initialDiningOrders = [
  {
    id: 'ORD-501',
    roomNumber: '401',
    guestName: 'Lord Alexander Wright',
    items: ['Australian Wagyu Ribeye Steak x2', 'Vintage Dom Pérignon Champagne x1'],
    totalAmount: 616,
    status: 'Out for Delivery',
    time: '18:30'
  },
  {
    id: 'ORD-502',
    roomNumber: '101',
    guestName: 'Sophia Loren',
    items: ['Artisanal Truffle Omelette x1', 'Organic Acai Bowl x1'],
    totalAmount: 69,
    status: 'Preparing',
    time: '18:45'
  }
];

export const HotelProvider = ({ children }) => {
  const [rooms, setRooms] = useState(() => {
    const saved = localStorage.getItem('hotel_rooms');
    return saved ? JSON.parse(saved) : initialRooms;
  });

  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('hotel_bookings');
    return saved ? JSON.parse(saved) : initialBookings;
  });

  const [guests, setGuests] = useState(() => {
    const saved = localStorage.getItem('hotel_guests');
    return saved ? JSON.parse(saved) : initialGuests;
  });

  const [housekeeping, setHousekeeping] = useState(() => {
    const saved = localStorage.getItem('hotel_housekeeping');
    return saved ? JSON.parse(saved) : initialHousekeeping;
  });

  const [diningMenu, setDiningMenu] = useState(() => {
    const saved = localStorage.getItem('hotel_dining_menu');
    let parsed = saved ? JSON.parse(saved) : null;
    if (parsed && parsed.some((item) => item.image && item.image.includes('photo-1592417817098'))) {
      parsed = initialDiningMenu;
      localStorage.setItem('hotel_dining_menu', JSON.stringify(initialDiningMenu));
    }
    return parsed && parsed.length >= 20 ? parsed : initialDiningMenu;
  });

  const [diningOrders, setDiningOrders] = useState(() => {
    const saved = localStorage.getItem('hotel_dining_orders');
    return saved ? JSON.parse(saved) : initialDiningOrders;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [portalMode, setPortalModeState] = useState(() => {
    // Check URL parameters first (e.g. ?admin, ?portal=admin, #admin)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('portal') === 'admin' || params.has('admin') || window.location.hash === '#admin') {
        return 'admin';
      }
    }
    const saved = localStorage.getItem('hotel_portal_mode');
    return saved ? saved : 'guest'; // Defaults to Guest / Customer Storefront
  });

  const setPortalMode = (mode) => {
    setPortalModeState(mode);
    localStorage.setItem('hotel_portal_mode', mode);
  };

  useEffect(() => {
    // Listen to hash / URL changes
    const checkUrlPortal = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('portal') === 'admin' || params.has('admin') || window.location.hash === '#admin') {
        setPortalModeState('admin');
      } else if (params.get('portal') === 'guest' || window.location.hash === '#guest') {
        setPortalModeState('guest');
      }
    };
    window.addEventListener('popstate', checkUrlPortal);
    window.addEventListener('hashchange', checkUrlPortal);
    return () => {
      window.removeEventListener('popstate', checkUrlPortal);
      window.removeEventListener('hashchange', checkUrlPortal);
    };
  }, []);
  const [toasts, setToasts] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [gmailConfirmationBooking, setGmailConfirmationBooking] = useState(null);

  const sendGmailConfirmation = async (booking) => {
    setGmailConfirmationBooking(booking);
    const recipient = booking.guestEmail || 'pmmuhammedibrahim786@gmail.com';

    try {
      await fetch('http://localhost:5000/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: recipient,
          guestName: booking.guestName,
          bookingId: booking.id,
          roomNumber: booking.roomNumber,
          totalAmount: booking.totalAmount,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut
        })
      });
    } catch (e) {
      console.warn('Backend mailer route unreachable, dispatched locally:', e);
    }

    addToast(`📩 Confirmation message received for ${recipient}!`, 'success');
  };

  // Notification System State
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('hotel_notifications');
    return saved ? JSON.parse(saved) : [
      {
        id: 'NOTIF-INIT-1',
        title: 'Room Service Operations Active',
        message: 'Kitchen is online and ready for room service orders.',
        type: 'info',
        timestamp: new Date().toISOString(),
        read: false
      }
    ];
  });

  // Dark / Light Theme Mode State
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('hotel_theme_mode') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('hotel_theme_mode', themeMode);
    if (themeMode === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [themeMode]);

  const toggleThemeMode = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // System Audit Trail Log State
  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('hotel_audit_logs');
    return saved ? JSON.parse(saved) : [
      {
        id: 'LOG-101',
        action: 'System Startup',
        details: 'Aurelia Resort Hotel SaaS Operations Engine Initialized',
        user: 'System Admin',
        role: 'Admin',
        module: 'System',
        timestamp: new Date().toISOString()
      },
      {
        id: 'LOG-102',
        action: 'Check-in',
        details: 'Lord Alexander Wright checked in to Penthouse Suite 401',
        user: 'Sarah Jenkins',
        role: 'Receptionist',
        module: 'Bookings',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('hotel_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const addAuditLog = async (action, details, user = 'Current Staff', role = 'Admin', module = 'System', relevantRecordId = 'N/A') => {
    const activeUser = (typeof currentUser !== 'undefined' && currentUser && currentUser.name) ? currentUser.name : user;
    const activeRole = (typeof currentUser !== 'undefined' && currentUser && currentUser.role) ? currentUser.role : role;

    const newLog = {
      id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
      action,
      details,
      user: activeUser,
      role: activeRole,
      module,
      relevantRecordId,
      timestamp: new Date().toISOString()
    };

    setAuditLogs((prev) => [newLog, ...prev]);

    try {
      await fetch('http://localhost:5000/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: activeUser,
          role: activeRole,
          action,
          module,
          details,
          relevantRecordId
        })
      });
    } catch (e) {
      console.warn('Backend audit log API call warning:', e);
    }
  };

  useEffect(() => {
    localStorage.setItem('hotel_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const [isSoundMuted, setIsSoundMuted] = useState(() => {
    return localStorage.getItem('hotel_sound_muted') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('hotel_sound_muted', isSoundMuted ? 'true' : 'false');
  }, [isSoundMuted]);

  const toggleSound = () => setIsSoundMuted((prev) => !prev);

  const playNotificationSound = () => {
    if (isSoundMuted) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      console.warn('Audio play restricted or unavailable:', e);
    }
  };

  const addNotification = (notif) => {
    const newNotif = {
      id: notif.id || `NOTIF-${Date.now()}`,
      title: notif.title || 'Room Service Update',
      message: notif.message || '',
      type: notif.type || 'info',
      status: notif.status,
      orderId: notif.orderId,
      roomNumber: notif.roomNumber,
      timestamp: notif.timestamp || new Date().toISOString(),
      read: false
    };

    setNotifications((prev) => [newNotif, ...prev]);
    playNotificationSound();
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  useEffect(() => {
    localStorage.setItem('hotel_dining_menu', JSON.stringify(diningMenu));
  }, [diningMenu]);

  useEffect(() => {
    localStorage.setItem('hotel_dining_orders', JSON.stringify(diningOrders));
  }, [diningOrders]);

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('hotel_user') || localStorage.getItem('customer_user') || localStorage.getItem('auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [userRole, setUserRole] = useState(() => {
    try {
      const saved = localStorage.getItem('hotel_user') || localStorage.getItem('customer_user') || localStorage.getItem('auth_user');
      const parsed = saved ? JSON.parse(saved) : null;
      return parsed?.role || localStorage.getItem('user_role') || 'Guest';
    } catch (e) {
      return 'Guest';
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const hasAuth = localStorage.getItem('hotel_auth') === 'true' || localStorage.getItem('customer_auth') === 'true';
    const role = localStorage.getItem('user_role');
    const saved = localStorage.getItem('hotel_user') || localStorage.getItem('customer_user') || localStorage.getItem('auth_user');
    const isStaffOrAdmin = role && (role.toLowerCase() === 'admin' || role.toLowerCase() === 'staff' || role.toLowerCase() === 'manager' || role.toLowerCase() === 'receptionist' || role.toLowerCase() === 'housekeeping');
    return (hasAuth || isStaffOrAdmin) && !!saved;
  });

  const [isGuestAuthenticated, setIsGuestAuthenticated] = useState(() => {
    return localStorage.getItem('guest_auth') === 'true';
  });

  const [currentGuest, setCurrentGuest] = useState(() => {
    const saved = localStorage.getItem('guest_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Auth Modal & Google Modal Global State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalConfig, setAuthModalConfig] = useState({ initialRole: 'guest', initialMode: 'login' });
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleModalConfig, setGoogleModalConfig] = useState({ role: 'guest', onSelect: null });

  const openAuthModal = (config = {}) => {
    setAuthModalConfig({
      initialRole: config.initialRole || 'guest',
      initialMode: config.initialMode || 'login'
    });
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openGoogleModal = (config = {}) => {
    setGoogleModalConfig({
      role: config.role || 'guest',
      onSelect: config.onSelect || null
    });
    setIsGoogleModalOpen(true);
  };

  const closeGoogleModal = () => {
    setIsGoogleModalOpen(false);
  };

  const loginGuest = (email, bookingId = '', name = '', phone = '') => {
    if (!email) {
      addToast('Please enter an email address.', 'error');
      return false;
    }

    const cleanEmail = email.trim().toLowerCase();
    let matched = guests.find((g) => g.email.toLowerCase() === cleanEmail);

    if (!matched) {
      matched = {
        id: `G-${Date.now()}`,
        name: name || cleanEmail.split('@')[0] || 'Guest',
        email: cleanEmail,
        phone: phone || 'N/A',
        vipStatus: 'Standard',
        stays: 1,
        totalSpent: 1200,
        tags: ['New Guest'],
        preferences: 'Ocean view balcony, Free Wi-Fi',
        foodPreferences: 'Standard gourmet preferences',
        roomPreferences: 'Standard Luxury Room',
        notes: []
      };
      setGuests((prev) => [matched, ...prev]);
    }

    setIsGuestAuthenticated(true);
    setCurrentGuest(matched);
    localStorage.setItem('guest_auth', 'true');
    localStorage.setItem('guest_user', JSON.stringify(matched));
    addToast(`Welcome to Aurelia Resort, ${matched.name}!`, 'success');
    return true;
  };

  const registerGuest = async ({ name, email, phone = '', preferences = '' }) => {
    if (!email || !name) {
      addToast('Name and email are required for registration.', 'error');
      return { success: false, message: 'Name and email are required.' };
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = guests.find((g) => g.email.toLowerCase() === cleanEmail);
    if (existing) {
      // Log them in if already registered
      setIsGuestAuthenticated(true);
      setCurrentGuest(existing);
      localStorage.setItem('guest_auth', 'true');
      localStorage.setItem('guest_user', JSON.stringify(existing));
      addToast(`Welcome back, ${existing.name}! Logged into your account.`, 'success');
      return { success: true, guest: existing };
    }

    const newGuest = {
      id: `G-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim() || '+1 (555) 019-2834',
      vipStatus: 'Standard',
      stays: 1,
      totalSpent: 0,
      tags: ['New Registered'],
      preferences: preferences || 'High floor, Free Wi-Fi, Ocean View',
      foodPreferences: 'Standard preferences',
      roomPreferences: 'Deluxe Suite',
      notes: [
        {
          id: `n-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          text: 'Guest registered online profile.',
          author: 'Self Registration'
        }
      ]
    };

    setGuests((prev) => [newGuest, ...prev]);
    setIsGuestAuthenticated(true);
    setCurrentGuest(newGuest);
    localStorage.setItem('guest_auth', 'true');
    localStorage.setItem('guest_user', JSON.stringify(newGuest));
    addToast(`Account created successfully! Welcome to Aurelia, ${newGuest.name}.`, 'success');
    return { success: true, guest: newGuest };
  };

  const verify2FAAndLogin = async (email, token) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/2fa/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, isSetup: false })
      });
      const data = await res.json();
      if (data.success && data.token) {
        const role = data.role || data.user?.role || 'Admin';
        syncAuthUser(data.user, data.token, role);
        addToast(data.message || `2FA Verified. Welcome back!`, 'success');
        return true;
      } else {
        addToast(data.message || 'Invalid 2FA token', 'error');
        return false;
      }
    } catch (err) {
      addToast('Error verifying 2FA token', 'error');
      return false;
    }
  };

  const registerAdmin = async ({ name, email, password, role = 'Manager', department = 'Operations' }) => {
    if (!name || !email || !password) {
      addToast('Please fill all required fields.', 'error');
      return { success: false, message: 'All fields required.' };
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, department })
      });

      const data = await res.json();
      if (data.success && data.token) {
        setIsAuthenticated(true);
        setCurrentUser(data.user);
        setJwtToken(data.token);
        localStorage.setItem('hotel_auth', 'true');
        localStorage.setItem('hotel_user', JSON.stringify(data.user));
        localStorage.setItem('hotel_jwt_token', data.token);
        addToast(`Staff account registered! Welcome, ${data.user.name} (${data.user.role}).`, 'success');
        return { success: true, user: data.user };
      }
    } catch (e) {
      // Local fallback
    }

    const localUser = {
      id: `USR-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: role,
      department: department
    };
    setIsAuthenticated(true);
    setCurrentUser(localUser);
    localStorage.setItem('hotel_auth', 'true');
    localStorage.setItem('hotel_user', JSON.stringify(localUser));
    addToast(`Staff account registered! Welcome, ${localUser.name} (${localUser.role}).`, 'success');
    return { success: true, user: localUser };
  };

  const loginWithGoogle = (selectedEmail, selectedName = '', targetRole = 'guest') => {
    const cleanEmail = selectedEmail.trim().toLowerCase();
    const displayName = selectedName || cleanEmail.split('@')[0].replace('.', ' ');

    if (targetRole === 'admin' || cleanEmail.includes('admin') || cleanEmail.includes('manager')) {
      const staffUser = {
        name: displayName,
        email: cleanEmail,
        role: 'Manager',
        department: 'Executive Operations',
        authProvider: 'Google'
      };
      setIsAuthenticated(true);
      setCurrentUser(staffUser);
      localStorage.setItem('hotel_auth', 'true');
      localStorage.setItem('hotel_user', JSON.stringify(staffUser));
      addToast(`Signed in with Google ID: ${cleanEmail} (Staff Console)`, 'success');
      return { success: true, user: staffUser, role: 'admin' };
    } else {
      let matched = guests.find((g) => g.email.toLowerCase() === cleanEmail);
      if (!matched) {
        matched = {
          id: `G-${Date.now()}`,
          name: displayName,
          email: cleanEmail,
          phone: '+1 (555) 012-9988',
          vipStatus: cleanEmail.includes('royal') ? 'Diamond' : 'Gold',
          stays: 2,
          totalSpent: 4500,
          tags: ['Google Auth', 'VIP'],
          preferences: 'Ocean view balcony, High floor',
          foodPreferences: 'Fresh Espresso, Gourmet breakfast',
          roomPreferences: 'Deluxe Suite',
          notes: []
        };
        setGuests((prev) => [matched, ...prev]);
      }
      setIsGuestAuthenticated(true);
      setCurrentGuest(matched);
      localStorage.setItem('guest_auth', 'true');
      localStorage.setItem('guest_user', JSON.stringify(matched));
      addToast(`Signed in with Google ID: ${cleanEmail}`, 'success');
      return { success: true, guest: matched, role: 'guest' };
    }
  };

  const logoutGuest = () => {
    setIsGuestAuthenticated(false);
    setCurrentGuest(null);
    localStorage.removeItem('guest_auth');
    localStorage.removeItem('guest_user');
    addToast('You have signed out of the Guest Portal.', 'info');
  };

  const [jwtToken, setJwtToken] = useState(() => localStorage.getItem('hotel_jwt_token') || '');

  const syncAuthUser = (userData, token, role) => {
    if (!userData) return;
    const assignedRole = role || userData.role || 'Guest';
    const userObj = { ...userData, role: assignedRole };
    const effectiveRole = assignedRole.toLowerCase();

    setCurrentUser(userObj);
    setUserRole(assignedRole);
    if (token) setJwtToken(token);

    localStorage.setItem('hotel_user', JSON.stringify(userObj));
    localStorage.setItem('customer_user', JSON.stringify(userObj));
    localStorage.setItem('auth_user', JSON.stringify(userObj));
    localStorage.setItem('user_role', assignedRole);
    if (token) {
      localStorage.setItem('hotel_jwt_token', token);
      localStorage.setItem('customer_jwt_token', token);
      localStorage.setItem('jwt_token', token);
    }

    if (effectiveRole === 'admin') {
      setIsAuthenticated(true);
      localStorage.setItem('hotel_auth', 'true');
      setPortalMode('admin');
      setActiveTab('dashboard');
    } else if (effectiveRole === 'staff' || ['manager', 'receptionist', 'housekeeping'].includes(effectiveRole)) {
      setIsAuthenticated(true);
      localStorage.setItem('hotel_auth', 'true');
      setPortalMode('staff');
      setActiveTab('dashboard');
    } else {
      setIsAuthenticated(false);
      localStorage.setItem('hotel_auth', 'false');
      setPortalMode('guest');
    }
  };

  const loginAdmin = async (loginIdentifier, password) => {
    if (!loginIdentifier || !password) {
      addToast('Please enter both username/email and password.', 'error');
      return false;
    }

    const cleanIdentifier = loginIdentifier.trim().toLowerCase();

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanIdentifier.includes('@') ? cleanIdentifier : undefined,
          username: !cleanIdentifier.includes('@') ? cleanIdentifier : undefined,
          identifier: cleanIdentifier,
          password
        })
      });

      const data = await res.json();
      if (data.requires2FA) {
        return { requires2FA: true, email: data.email || cleanIdentifier };
      }
      if (data.success && data.token) {
        const role = data.role || data.user?.role || 'Admin';
        syncAuthUser(data.user, data.token, role);
        addToast(data.message || `Welcome back, ${data.user.name}! Authenticated as ${role}.`, 'success');
        return true;
      } else {
        addToast(data.message || 'Invalid username, email, or password.', 'error');
        return false;
      }
    } catch (err) {
      console.warn('Backend offline, authenticating locally:', err.message);
      const role = cleanIdentifier.includes('admin')
        ? 'Admin'
        : cleanIdentifier.includes('reception')
        ? 'Receptionist'
        : cleanIdentifier.includes('housekeeping')
        ? 'Housekeeping'
        : 'Staff';
      const cleanName = cleanIdentifier.includes('@')
        ? cleanIdentifier.split('@')[0].replace('.', ' ')
        : cleanIdentifier;
      const name = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      const email = cleanIdentifier.includes('@') ? cleanIdentifier : `${cleanIdentifier}@aureliagrand.com`;
      const user = { name, username: cleanIdentifier.replace('@aureliagrand.com', ''), email, role };
      syncAuthUser(user, `jwt_${Date.now()}`, role);
      addToast(`Welcome back, ${name}! Logged in as ${role}.`, 'success');
      return true;
    }
  };

  const logoutAdmin = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUserRole('Guest');
    setJwtToken('');
    localStorage.removeItem('hotel_auth');
    localStorage.removeItem('customer_auth');
    localStorage.removeItem('hotel_user');
    localStorage.removeItem('customer_user');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('hotel_jwt_token');
    localStorage.removeItem('customer_jwt_token');
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
    setPortalMode('guest');
    addToast('You have been signed out.', 'info');
  };

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('hotel_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('hotel_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('hotel_guests', JSON.stringify(guests));
  }, [guests]);

  useEffect(() => {
    localStorage.setItem('hotel_housekeeping', JSON.stringify(housekeeping));
  }, [housekeeping]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Actions
  const updateRoomStatus = async (roomNumber, newStatus) => {
    try {
      await api.put(`/api/rooms/${roomNumber}/status`, { status: newStatus });
      setRooms((prev) =>
        prev.map((r) => (r.number === roomNumber ? { ...r, status: newStatus } : r))
      );
      addToast(`Room ${roomNumber} status updated to ${newStatus}`, 'success');
    } catch (e) {
      addToast(e.message || 'Failed to update room status', 'error');
    }
  };

  const updateRoomPrice = async (roomNumber, newPrice) => {
    try {
      await api.patch(`/api/rooms/${roomNumber}/price`, { price: Number(newPrice) });
      setRooms((prev) =>
        prev.map((r) => (r.number === roomNumber ? { ...r, price: Number(newPrice) } : r))
      );
      addToast(`Room ${roomNumber} price updated to $${newPrice}/night!`, 'success');
    } catch(e) {
      addToast(e.message || 'Failed to update room price', 'error');
    }
  };

  const addGuestNote = (guestId, noteText) => {
    if (!noteText.trim()) return;
    const newNote = {
      id: `NOTE-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      text: noteText,
      author: currentUser?.name || 'Concierge Desk'
    };
    setGuests((prev) =>
      prev.map((g) => (g.id === guestId ? { ...g, notes: [newNote, ...(g.notes || [])] } : g))
    );
    addToast('Internal guest note saved!', 'success');
  };

  const updateGuestTags = (guestId, newTags) => {
    setGuests((prev) =>
      prev.map((g) => (g.id === guestId ? { ...g, tags: newTags } : g))
    );
    addToast('Guest CRM tags updated!', 'info');
  };

  const updateGuestPreferences = (guestId, foodPref, roomPref) => {
    setGuests((prev) =>
      prev.map((g) =>
        g.id === guestId ? { ...g, foodPreferences: foodPref, roomPreferences: roomPref } : g
      )
    );
    addToast('Guest preferences updated successfully!', 'success');
  };

  const addRoom = async (roomData) => {
    try {
      const res = await api.post('/api/rooms', roomData);
      const newRoom = res.data || res.room || res;
      setRooms((prev) => [newRoom, ...prev]);
      addToast(`Room ${roomData.number} successfully added!`, 'success');
    } catch(e) {
      addToast(e.message || 'Failed to add room', 'error');
    }
  };

  const checkInGuest = async (bookingId) => {
    try {
      await api.post(`/api/bookings/${bookingId}/checkin`);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'Checked-In' } : b))
      );
      const booking = bookings.find((b) => b.id === bookingId);
      if (booking) updateRoomStatus(booking.roomNumber, 'Occupied');
      addToast(`Guest successfully checked in!`, 'success');
    } catch (e) {
      addToast(e.message || 'Check-in failed', 'error');
    }
  };

  const checkOutGuest = async (bookingId) => {
    try {
      await api.post(`/api/bookings/${bookingId}/checkout`);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'Checked-Out' } : b))
      );
      const booking = bookings.find((b) => b.id === bookingId);
      if (booking) {
        updateRoomStatus(booking.roomNumber, 'Cleaning');
        const newTask = {
          id: `HK-${Date.now()}`,
          roomNumber: booking.roomNumber,
          type: 'Departure Turnaround Clean',
          assignee: 'Unassigned',
          priority: 'High',
          status: 'Cleaning'
        };
        setHousekeeping((prev) => [newTask, ...prev]);
      }
      addToast(`Guest checked out successfully!`, 'info');
    } catch (e) {
      addToast(e.message || 'Check-out failed', 'error');
    }
  };

  const addBooking = async (newBookingData) => {
    try {
      const res = await api.post('/api/bookings', newBookingData);
      const newBooking = res.booking || res.data || res;
      setBookings((prev) => [newBooking, ...prev]);
      updateRoomStatus(newBookingData.roomNumber, 'Reserved');
      
      const existingGuest = guests.find((g) => g.email.toLowerCase() === newBookingData.guestEmail.toLowerCase());
      if (!existingGuest) {
        const newGuest = {
          id: `G-${Date.now()}`,
          name: newBookingData.guestName,
          email: newBookingData.guestEmail,
          phone: newBookingData.guestPhone || 'N/A',
          vipStatus: 'Standard',
          stays: 1,
          totalSpent: newBookingData.totalAmount,
          preferences: newBookingData.specialRequests || 'None'
        };
        setGuests((prev) => [newGuest, ...prev]);
      } else {
        setGuests((prev) =>
          prev.map((g) =>
            g.id === existingGuest.id
              ? { ...g, stays: g.stays + 1, totalSpent: g.totalSpent + newBookingData.totalAmount }
              : g
          )
        );
      }
      addToast(`Reservation confirmed for ${newBookingData.guestName}!`, 'success');
      sendGmailConfirmation(newBooking);
      return newBooking;
    } catch (e) {
      addToast(e.message || 'Failed to add booking', 'error');
      return null;
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      await api.post(`/api/bookings/${bookingId}/cancel`);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'Cancelled' } : b))
      );
      const booking = bookings.find((b) => b.id === bookingId);
      if (booking) updateRoomStatus(booking.roomNumber, 'Available');
      addToast(`Booking ${bookingId} has been cancelled.`, 'warning');
    } catch (e) {
      addToast(e.message || 'Failed to cancel booking', 'error');
    }
  };

  const deleteBooking = async (bookingId) => {
    try {
      await api.delete(`/api/bookings/${bookingId}`);
      const booking = bookings.find((b) => b.id === bookingId);
      if (booking) updateRoomStatus(booking.roomNumber, 'Available');
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      addToast(`Booking ${bookingId} permanently deleted!`, 'error');
    } catch (e) {
      addToast(e.message || 'Failed to delete booking', 'error');
    }
  };

  const deleteRoom = async (roomNumber) => {
    try {
      await api.delete(`/api/rooms/${roomNumber}`);
      setRooms((prev) => prev.filter((r) => r.number !== roomNumber));
      addToast(`Room ${roomNumber} removed from hotel inventory!`, 'error');
    } catch(e) {
      addToast(e.message || 'Failed to delete room', 'error');
    }
  };

  const deleteGuest = async (guestId) => {
    const guest = guests.find((g) => g.id === guestId);
    setGuests((prev) => prev.filter((g) => g.id !== guestId));
    addToast(`Guest CRM profile '${guest?.name || guestId}' deleted!`, 'error');

    try {
      await fetch(`http://localhost:5000/api/guests/${guestId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Backend guest delete call warning:', e);
    }
  };

  const deleteHousekeepingTask = (taskId) => {
    setHousekeeping((prev) => prev.filter((h) => h.id !== taskId));
    addToast(`Housekeeping task ${taskId} removed!`, 'info');
  };

  const updateHousekeepingStatus = (taskId, newStatus) => {
    setHousekeeping((prev) =>
      prev.map((h) => {
        if (h.id === taskId) {
          if (newStatus === 'Completed') {
            updateRoomStatus(h.roomNumber, 'Available');
          }
          return { ...h, status: newStatus };
        }
        return h;
      })
    );
    addToast(`Housekeeping task status updated to ${newStatus}`, 'success');
  };

  const updateBookingPaymentStatus = async (bookingId, paymentStatus) => {
    try {
      await fetch(`http://localhost:5000/api/bookings/${bookingId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus })
      });
    } catch (e) {
      console.warn('Backend offline, updating payment status locally:', e);
    }
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, paymentStatus } : b))
    );
    addToast(`Booking #${bookingId} payment status updated to ${paymentStatus}!`, 'success');
  };

  const placeRoomServiceOrder = async (orderData) => {
    try {
      const response = await fetch('http://localhost:5000/api/room-service/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (response.ok) {
        const data = await response.json();
        setDiningOrders((prev) => [data.order, ...prev.filter((o) => o.id !== data.order.id)]);
        addToast(`Room Service Order #${data.order.id} sent to Kitchen!`, 'success');
        addNotification(data.notification);
        addAuditLog('Room Service Order', `Placed order #${data.order.id} for Room ${data.order.roomNumber} ($${data.order.totalAmount})`);
        return data.order;
      }
    } catch (e) {
      console.warn('Backend offline, handling room service order locally:', e);
    }

    const fallbackOrder = {
      ...orderData,
      id: `ORD-${Math.floor(100 + Math.random() * 900)}`,
      status: 'Preparing',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setDiningOrders((prev) => [fallbackOrder, ...prev]);
    addToast(`Room Service Order #${fallbackOrder.id} placed for Room ${orderData.roomNumber}!`, 'success');

    const notif = {
      title: 'New Room Service Order Received',
      message: `Room ${fallbackOrder.roomNumber} ordered items. Total: $${fallbackOrder.totalAmount}`,
      type: 'order_created',
      orderId: fallbackOrder.id,
      roomNumber: fallbackOrder.roomNumber
    };
    addNotification(notif);
    return fallbackOrder;
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/room-service/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        const data = await response.json();
        setDiningOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        addToast(`Order #${orderId} status updated to ${newStatus}`, 'info');
        addNotification(data.notification);
        return;
      }
    } catch (e) {
      console.warn('Backend offline, updating order status locally:', e);
    }

    setDiningOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    addToast(`Order #${orderId} status updated to ${newStatus}`, 'info');
    addNotification({
      title: `Order Status: ${newStatus}`,
      message: `Order #${orderId} has been marked as ${newStatus}.`,
      type: 'status_updated',
      status: newStatus,
      orderId: orderId
    });
  };

  const resetAllData = () => {
    localStorage.removeItem('hotel_rooms');
    localStorage.removeItem('hotel_bookings');
    localStorage.removeItem('hotel_guests');
    localStorage.removeItem('hotel_housekeeping');
    localStorage.removeItem('hotel_dining_menu');
    localStorage.removeItem('hotel_dining_orders');
    setRooms(initialRooms);
    setBookings(initialBookings);
    setGuests(initialGuests);
    setHousekeeping(initialHousekeeping);
    setDiningMenu(initialDiningMenu);
    setDiningOrders(initialDiningOrders);
    addToast('All hotel database data reset to demo defaults!', 'info');
  };

  // Real-Time Socket.io Connection & Backend Sync
  const BACKEND_URL = 'http://localhost:5000';
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [backendStats, setBackendStats] = useState(null);

  useEffect(() => {
    let socket;
    if (window.io) {
      socket = window.io(BACKEND_URL);

      socket.on('connect', () => {
        setIsSocketConnected(true);
        console.log('⚡ [Socket.io]: Connected to backend server at http://localhost:5000');
      });

      socket.on('disconnect', () => {
        setIsSocketConnected(false);
        console.log('🔌 [Socket.io]: Disconnected from backend server');
      });

      socket.on('initial_data', (data) => {
        if (data.rooms) setRooms(data.rooms);
        if (data.bookings) setBookings(data.bookings);
        if (data.roomServiceOrders) setDiningOrders(data.roomServiceOrders);
        if (data.stats) setBackendStats(data.stats);
      });

      socket.on('room_service_order_created', (newOrder) => {
        setDiningOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
      });

      socket.on('room_service_order_updated', (updatedOrder) => {
        setDiningOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
      });

      socket.on('notification', (notifData) => {
        addNotification(notifData);
      });

      socket.on('room_updated', (updatedRoom) => {
        setRooms((prev) => prev.map((r) => (r.number === updatedRoom.number ? updatedRoom : r)));
      });

      socket.on('booking_created', (newBooking) => {
        setBookings((prev) => [newBooking, ...prev]);
      });

      socket.on('guest_checked_in', (updatedBooking) => {
        setBookings((prev) => prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b)));
      });

      socket.on('guest_checked_out', (updatedBooking) => {
        setBookings((prev) => prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b)));
      });

      socket.on('booking_cancelled', (updatedBooking) => {
        setBookings((prev) => prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b)));
      });

      socket.on('stats_updated', (stats) => {
        setBackendStats(stats);
      });
    }

    // Backup REST API fetch
    fetch(`${BACKEND_URL}/api/stats`)
      .then((res) => res.json())
      .then((data) => {
        setBackendStats(data);
        setIsSocketConnected(true);
      })
      .catch(() => {
        console.log('Backend API starting or offline - using local state fallback');
      });

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  // Metrics calculation
  const totalRoomsCount = rooms.length;
  const occupiedRoomsCount = rooms.filter((r) => r.status === 'Occupied').length;
  const reservedRoomsCount = rooms.filter((r) => r.status === 'Reserved').length;
  const availableRoomsCount = rooms.filter((r) => r.status === 'Available').length;
  const cleaningRoomsCount = rooms.filter((r) => r.status === 'Cleaning').length;

  const occupancyRate = Math.round((occupiedRoomsCount / totalRoomsCount) * 100);
  const totalRevenue = bookings
    .filter((b) => b.status !== 'Cancelled')
    .reduce((acc, b) => acc + (b.totalAmount || 0), 0) || 22350;

  const defaultRevenueTimeline = [
    { month: 'Jan', revenue: 24500, bookings: 42, occupancy: 68 },
    { month: 'Feb', revenue: 28200, bookings: 48, occupancy: 74 },
    { month: 'Mar', revenue: 31000, bookings: 54, occupancy: 81 },
    { month: 'Apr', revenue: 29800, bookings: 50, occupancy: 76 },
    { month: 'May', revenue: 36400, bookings: 62, occupancy: 88 },
    { month: 'Jun', revenue: 41200, bookings: 71, occupancy: 92 },
    { month: 'Jul', revenue: 48900, bookings: 84, occupancy: 95 },
    { month: 'Aug (Current)', revenue: totalRevenue, bookings: bookings.length, occupancy: occupancyRate }
  ];

  const defaultWeeklyActivity = [
    { day: 'Mon', checkIns: 12, checkOuts: 8 },
    { day: 'Tue', checkIns: 15, checkOuts: 10 },
    { day: 'Wed', checkIns: 18, checkOuts: 14 },
    { day: 'Thu', checkIns: 22, checkOuts: 16 },
    { day: 'Fri', checkIns: 28, checkOuts: 19 },
    { day: 'Sat', checkIns: 32, checkOuts: 24 },
    { day: 'Sun', checkIns: 20, checkOuts: 26 }
  ];

  const defaultRoomDistribution = [
    { name: 'Available', value: availableRoomsCount, color: '#10B981' },
    { name: 'Occupied', value: occupiedRoomsCount, color: '#EF4444' },
    { name: 'Reserved', value: reservedRoomsCount, color: '#F59E0B' },
    { name: 'Cleaning', value: cleaningRoomsCount, color: '#3B82F6' }
  ];

  return (
    <HotelContext.Provider
      value={{
        rooms,
        bookings,
        guests,
        housekeeping,
        diningMenu,
        diningOrders,
        placeRoomServiceOrder,
        updateOrderStatus,
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
        markAllNotificationsRead,
        clearNotifications,
        isSoundMuted,
        toggleSound,
        activeTab,
        setActiveTab,
        portalMode,
        setPortalMode,
        isAuthModalOpen,
        authModalConfig,
        openAuthModal,
        closeAuthModal,
        isGoogleModalOpen,
        googleModalConfig,
        openGoogleModal,
        closeGoogleModal,
        isAuthenticated,
        setIsAuthenticated,
        currentUser,
        setCurrentUser,
        userRole,
        setUserRole,
        syncAuthUser,
        jwtToken,
        loginAdmin,
        verify2FAAndLogin,
        registerAdmin,
        logoutAdmin,
        isGuestAuthenticated,
        currentGuest,
        loginGuest,
        registerGuest,
        loginWithGoogle,
        logoutGuest,
        toasts,
        addToast,
        removeToast,
        updateRoomStatus,
        updateRoomPrice,
        addGuestNote,
        updateGuestTags,
        updateGuestPreferences,
        addRoom,
        checkInGuest,
        checkOutGuest,
        addBooking,
        cancelBooking,
        deleteBooking,
        deleteRoom,
        deleteGuest,
        deleteHousekeepingTask,
        updateHousekeepingStatus,
        setHousekeeping,
        updateBookingPaymentStatus,
        auditLogs,
        addAuditLog,
        themeMode,
        toggleThemeMode,
        resetAllData,
        selectedInvoice,
        setSelectedInvoice,
        gmailConfirmationBooking,
        setGmailConfirmationBooking,
        sendGmailConfirmation,
        isSocketConnected,
        metrics: {
          totalRoomsCount: backendStats?.totalRoomsCount || totalRoomsCount,
          occupiedRoomsCount: backendStats?.occupiedRoomsCount || occupiedRoomsCount,
          reservedRoomsCount: backendStats?.reservedRoomsCount || reservedRoomsCount,
          availableRoomsCount: backendStats?.availableRoomsCount || availableRoomsCount,
          cleaningRoomsCount: backendStats?.cleaningRoomsCount || cleaningRoomsCount,
          occupancyRate: backendStats?.occupancyRate || occupancyRate,
          totalRevenue: backendStats?.totalRevenue || totalRevenue,
          revenueTimeline: backendStats?.revenueTimeline || defaultRevenueTimeline,
          weeklyActivity: backendStats?.weeklyActivity || defaultWeeklyActivity,
          roomDistribution: backendStats?.roomDistribution || defaultRoomDistribution
        }
      }}
    >
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = () => useContext(HotelContext);

