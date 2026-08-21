import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide user full name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide user email address'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Please provide password'],
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ['Admin', 'Manager', 'Receptionist', 'Housekeeping', 'Guest'],
      default: 'Guest'
    },
    department: {
      type: String,
      default: 'General'
    }
  },
  {
    timestamps: true
  }
);

// Hash password prior to saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);

// In-Memory Fallback Store & Seed Helpers
const inMemoryUsers = [
  {
    _id: 'USR-ADMIN-01',
    id: 'USR-ADMIN-01',
    name: 'Muhammed Ibrahim (GM)',
    email: 'pmmuhammedibrahim786@gmail.com',
    password: '$2a$10$e0MYzXyjpJS7Pd0RVvHwHeFj5d7KjK8D2mQzG1a.X1H1e1a1e1a1e', // bcrypt hash placeholder
    rawPassword: 'adminpassword123',
    role: 'Admin',
    department: 'Executive Operations'
  },
  {
    _id: 'USR-MGR-01',
    id: 'USR-MGR-01',
    name: 'General Manager',
    email: 'admin@aurelia.com',
    password: '$2a$10$e0MYzXyjpJS7Pd0RVvHwHeFj5d7KjK8D2mQzG1a.X1H1e1a1e1a1e',
    rawPassword: 'adminpassword123',
    role: 'Manager',
    department: 'Executive Operations'
  },
  {
    _id: 'USR-REC-01',
    id: 'USR-REC-01',
    name: 'Sarah Jenkins',
    email: 'reception@aurelia.com',
    password: '$2a$10$e0MYzXyjpJS7Pd0RVvHwHeFj5d7KjK8D2mQzG1a.X1H1e1a1e1a1e',
    rawPassword: 'receptionpassword123',
    role: 'Receptionist',
    department: 'Front Desk'
  },
  {
    _id: 'USR-HK-01',
    id: 'USR-HK-01',
    name: 'Maria Garcia',
    email: 'housekeeping@aurelia.com',
    password: '$2a$10$e0MYzXyjpJS7Pd0RVvHwHeFj5d7KjK8D2mQzG1a.X1H1e1a1e1a1e',
    rawPassword: 'housekeepingpassword123',
    role: 'Housekeeping',
    department: 'Sanitation'
  },
  {
    _id: 'USR-GUEST-01',
    id: 'USR-GUEST-01',
    name: 'Lord Alexander Wright',
    email: 'alexander.wright@royals.co.uk',
    password: '$2a$10$e0MYzXyjpJS7Pd0RVvHwHeFj5d7KjK8D2mQzG1a.X1H1e1a1e1a1e',
    rawPassword: 'guestpassword123',
    role: 'Guest',
    department: 'Guest Concierge'
  }
];

export const findUserByEmail = async (email) => {
  try {
    if (mongoose.connection.readyState === 1) {
      return await User.findOne({ email: email.toLowerCase() }).select('+password');
    }
  } catch (err) {
    console.warn('MongoDB query warning, using fallback store:', err.message);
  }
  const found = inMemoryUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
  return found || null;
};

export const findUserById = async (id) => {
  try {
    if (mongoose.connection.readyState === 1) {
      return await User.findById(id);
    }
  } catch (err) {
    console.warn('MongoDB query warning, using fallback store:', err.message);
  }
  return inMemoryUsers.find((u) => u._id === id || u.id === id) || null;
};

export const createUser = async ({ name, email, password, role = 'Guest', department = 'General' }) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.create({ name, email, password, role, department });
      return user;
    }
  } catch (err) {
    console.warn('MongoDB save warning, creating in-memory user:', err.message);
  }
  const newUser = {
    _id: `USR-${Date.now()}`,
    id: `USR-${Date.now()}`,
    name,
    email: email.toLowerCase(),
    password,
    role,
    department
  };
  inMemoryUsers.push(newUser);
  return newUser;
};
