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
    country: {
      type: String,
      default: 'United States'
    },
    password: {
      type: String,
      required: [true, 'Please provide password'],
      minlength: 6,
      select: false
    },
    avatar: {
      type: String,
      default: 'data:image/svg+xml;utf8,<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><circle cx="64" cy="64" r="64" fill="%23E2E8F0"/><circle cx="64" cy="46" r="22" fill="%23718096"/><path d="M22 108C22 84.804 40.804 66 64 66C87.196 66 106 84.804 106 108V114C106 114 90 124 64 124C38 124 22 114 22 114V108Z" fill="%23718096"/></svg>'
    },
    role: {
      type: String,
      enum: ['Guest', 'Customer', 'Staff', 'Admin', 'Manager', 'Receptionist', 'Housekeeping'],
      default: 'Guest'
    },
    membership: {
      type: String,
      enum: ['Standard', 'Silver', 'Gold', 'Diamond'],
      default: 'Standard'
    },
    vipStatus: {
      type: String,
      enum: ['Standard', 'Silver', 'Gold', 'Diamond'],
      default: 'Standard'
    },
    rewardPoints: {
      type: Number,
      default: 100
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
      default: []
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationOTP: {
      type: String,
      default: null
    },
    verificationExpires: {
      type: Date,
      default: null
    },
    resetPasswordOTP: {
      type: String,
      default: null
    },
    resetPasswordExpires: {
      type: Date,
      default: null
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
    ]
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

export const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);

// In-Memory Fallback Store for seamless offline / testing operation
export let inMemoryCustomers = [];

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

export const findCustomerByResetOTP = async (otp, email = '') => {
  const cleanOtp = String(otp).trim();
  const cleanEmail = email ? email.trim().toLowerCase() : '';
  try {
    if (mongoose.connection.readyState === 1) {
      const query = {
        resetPasswordOTP: cleanOtp,
        resetPasswordExpires: { $gt: new Date() }
      };
      if (cleanEmail) query.email = cleanEmail;
      return await Customer.findOne(query);
    }
  } catch (err) {
    console.warn('MongoDB query warning, checking fallback customer store:', err.message);
  }
  return (
    inMemoryCustomers.find(
      (c) =>
        String(c.resetPasswordOTP) === cleanOtp &&
        (!cleanEmail || c.email.toLowerCase() === cleanEmail) &&
        (!c.resetPasswordExpires || new Date(c.resetPasswordExpires) > new Date())
    ) || null
  );
};

export const findCustomerByVerificationOTP = async (otp, email = '') => {
  const cleanOtp = String(otp).trim();
  const cleanEmail = email ? email.trim().toLowerCase() : '';
  try {
    if (mongoose.connection.readyState === 1) {
      const query = {
        verificationOTP: cleanOtp,
        verificationExpires: { $gt: new Date() }
      };
      if (cleanEmail) query.email = cleanEmail;
      return await Customer.findOne(query);
    }
  } catch (err) {
    console.warn('MongoDB query warning, checking fallback store for OTP:', err.message);
  }
  return (
    inMemoryCustomers.find(
      (c) =>
        String(c.verificationOTP) === cleanOtp &&
        (!cleanEmail || c.email.toLowerCase() === cleanEmail) &&
        (!c.verificationExpires || new Date(c.verificationExpires) > new Date())
    ) || null
  );
};

export const createCustomer = async ({
  name,
  email,
  phone = '',
  country = 'United States',
  password,
  avatar,
  role = 'Guest',
  membership = 'Standard',
  isVerified = false,
  verificationOTP = null,
  verificationExpires = null
}) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const customer = await Customer.create({
        name,
        email: email.toLowerCase(),
        phone,
        country,
        password,
        avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        role: role || 'Guest',
        membership: membership || 'Standard',
        vipStatus: membership || 'Standard',
        rewardPoints: 100,
        isVerified,
        verificationOTP,
        verificationExpires
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
    phone: phone || '',
    country: country || 'United States',
    password: hashedPassword,
    rawPassword: password,
    avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    role: role || 'Guest',
    membership: membership || 'Standard',
    vipStatus: membership || 'Standard',
    rewardPoints: 100,
    address: '',
    foodPreferences: 'Standard Gourmet',
    roomPreferences: 'Ocean View Balcony',
    favorites: [],
    isVerified,
    verificationOTP,
    verificationExpires,
    notifications: [
      {
        id: `CNOTIF-${Date.now()}`,
        title: 'Welcome to Aurelia Resort',
        message: 'Your account is active. Explore our luxury suites and villas.',
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
