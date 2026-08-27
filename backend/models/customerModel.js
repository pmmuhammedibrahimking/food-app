import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide customer full name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide email address'],
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      default: ''
    },
    password: {
      type: String,
      required: [true, 'Please provide password'],
      minlength: 6,
      select: false
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
    },
    role: {
      type: String,
      default: 'Customer'
    },
    vipStatus: {
      type: String,
      enum: ['Standard', 'Silver', 'Gold', 'Diamond'],
      default: 'Standard'
    },
    address: {
      type: String,
      default: ''
    },
    foodPreferences: {
      type: String,
      default: 'Standard Gourmet'
    },
    roomPreferences: {
      type: String,
      default: 'High Floor, Ocean View'
    },
    favorites: {
      type: [String],
      default: ['401', '301']
    },
    notifications: [
      {
        id: { type: String, default: () => `CNOTIF-${Date.now()}` },
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: { type: String, default: 'info' },
        timestamp: { type: String, default: () => new Date().toISOString() },
        read: { type: Boolean, default: false }
      }
    ],
    resetPasswordToken: String,
    resetPasswordExpires: Date
  },
  {
    timestamps: true
  }
);

// Hash password before saving
customerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
customerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const Customer = mongoose.model('Customer', customerSchema);

// In-Memory Fallback Store for seamless offline / demo operation
export let inMemoryCustomers = [
  {
    _id: 'CUST-100',
    id: 'CUST-100',
    name: 'Muhammed Ibrahim',
    email: 'pmmuhammedibrahim786@gmail.com',
    phone: '+1 (555) 786-0199',
    password: '$2a$10$e0MYzXyjpJS7Pd0RVvHwHeFj5d7KjK8D2mQzG1a.X1H1e1a1e1a1e',
    rawPassword: 'customerpassword123',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    role: 'Customer',
    vipStatus: 'Diamond',
    address: '100 Oceanfront Promenade, Beverly Hills, CA',
    foodPreferences: 'Vintage Dom Pérignon Champagne, Wagyu Steak, Fresh Espresso',
    roomPreferences: 'Presidential Sovereign Suite 401, Private Balcony, High Floor',
    favorites: ['401', '301', '101'],
    notifications: [
      {
        id: 'CNOTIF-1',
        title: 'Diamond VIP Welcome Privileges',
        message: 'Your 24/7 dedicated butler service and private helipad access are active.',
        type: 'vip',
        timestamp: new Date().toISOString(),
        read: false
      },
      {
        id: 'CNOTIF-2',
        title: 'Reservation Confirmed #BK-7860',
        message: 'Penthouse Suite 401 reservation confirmed for Aug 20 - Aug 28.',
        type: 'booking',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        read: true
      }
    ],
    createdAt: '2026-01-15T00:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'CUST-101',
    id: 'CUST-101',
    name: 'Lord Alexander Wright',
    email: 'alexander.wright@royals.co.uk',
    phone: '+44 7911 123456',
    password: '$2a$10$e0MYzXyjpJS7Pd0RVvHwHeFj5d7KjK8D2mQzG1a.X1H1e1a1e1a1e',
    rawPassword: 'customerpassword123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    role: 'Customer',
    vipStatus: 'Gold',
    address: '10 Kensington Palace Gardens, London, UK',
    foodPreferences: 'Dom Pérignon on arrival, Caviar Omelette, Organic Gluten-free',
    roomPreferences: 'High Floor Penthouse, Quiet Wing, Jacuzzi Suite',
    favorites: ['401', '201'],
    notifications: [
      {
        id: 'CNOTIF-3',
        title: 'Gold VIP Status Active',
        message: 'Enjoy complimentary Michelin breakfast and late 3 PM check-out privileges.',
        type: 'vip',
        timestamp: new Date().toISOString(),
        read: false
      }
    ],
    createdAt: '2026-02-10T00:00:00.000Z',
    updatedAt: new Date().toISOString()
  }
];

export const findCustomerByEmail = async (email) => {
  return findCustomerByIdentifier(email);
};

export const findCustomerByIdentifier = async (identifier) => {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();
  try {
    if (mongoose.connection.readyState === 1) {
      return await Customer.findOne({
        $or: [{ email: clean }, { username: clean }]
      }).select('+password');
    }
  } catch (err) {
    console.warn('MongoDB query warning, using fallback customer store:', err.message);
  }
  const found = inMemoryCustomers.find(
    (c) => (c.email && c.email.toLowerCase() === clean) || (c.username && c.username.toLowerCase() === clean) || (c.name && c.name.toLowerCase().replace(/\s+/g, '') === clean)
  );
  return found || null;
};

export const findCustomerById = async (id) => {
  try {
    if (mongoose.connection.readyState === 1) {
      return await Customer.findById(id);
    }
  } catch (err) {
    console.warn('MongoDB query warning, using fallback customer store:', err.message);
  }
  return inMemoryCustomers.find((c) => c._id === id || c.id === id) || null;
};

export const findCustomerByResetToken = async (token) => {
  try {
    if (mongoose.connection.readyState === 1) {
      return await Customer.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });
    }
  } catch (err) {
    console.warn('MongoDB query warning, checking fallback customer store:', err.message);
  }
  return (
    inMemoryCustomers.find(
      (c) => c.resetPasswordToken === token && (!c.resetPasswordExpires || new Date(c.resetPasswordExpires) > new Date())
    ) || null
  );
};

export const createCustomer = async ({ name, email, phone = '', password, avatar, vipStatus = 'Standard' }) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const customer = await Customer.create({
        name,
        email: email.toLowerCase(),
        phone,
        password,
        avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        role: 'Customer',
        vipStatus
      });
      return customer;
    }
  } catch (err) {
    console.warn('MongoDB save warning, creating in-memory customer:', err.message);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newCustomer = {
    _id: `CUST-${Date.now()}`,
    id: `CUST-${Date.now()}`,
    name,
    email: email.toLowerCase(),
    phone: phone || 'N/A',
    password: hashedPassword,
    rawPassword: password,
    avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    role: 'Customer',
    vipStatus,
    address: '',
    foodPreferences: 'Standard Gourmet',
    roomPreferences: 'Ocean View Balcony',
    favorites: ['401'],
    notifications: [
      {
        id: `CNOTIF-${Date.now()}`,
        title: 'Welcome to Aurelia Grand Resort',
        message: 'Your customer account is now active. Explore our luxury suites and villas.',
        type: 'info',
        timestamp: new Date().toISOString(),
        read: false
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  inMemoryCustomers.push(newCustomer);
  return newCustomer;
};
