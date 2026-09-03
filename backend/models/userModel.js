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
      enum: ['Admin', 'Staff', 'Manager', 'Receptionist', 'Housekeeping', 'Guest', 'Customer'],
      default: 'Guest'
    },
    department: {
      type: String,
      default: 'General'
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    isLocked: {
      type: Boolean,
      default: false
    },
    lockUntil: {
      type: Date
    },
    twoFactorSecret: {
      type: String
    },
    isTwoFactorEnabled: {
      type: Boolean,
      default: false
    },
    avatar: {
      type: String,
      default: 'data:image/svg+xml;utf8,<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><circle cx="64" cy="64" r="64" fill="%23E2E8F0"/><circle cx="64" cy="46" r="22" fill="%23718096"/><path d="M22 108C22 84.804 40.804 66 64 66C87.196 66 106 84.804 106 108V114C106 114 90 124 64 124C38 124 22 114 22 114V108Z" fill="%23718096"/></svg>'
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

// In-Memory Fallback Store
const inMemoryUsers = [
  {
    _id: 'USR-ADMIN-01',
    id: 'USR-ADMIN-01',
    name: 'Executive Admin',
    email: 'admin@aureliagrand.com',
    password: '$2a$10$e0MYzXyjpJS7Pd0RVvHwHeFj5d7KjK8D2mQzG1a.X1H1e1a1e1a1e',
    rawPassword: 'adminpassword123',
    role: 'Admin',
    department: 'Executive Operations',
    avatar: 'data:image/svg+xml;utf8,<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><circle cx="64" cy="64" r="64" fill="%23E2E8F0"/><circle cx="64" cy="46" r="22" fill="%23718096"/><path d="M22 108C22 84.804 40.804 66 64 66C87.196 66 106 84.804 106 108V114C106 114 90 124 64 124C38 124 22 114 22 114V108Z" fill="%23718096"/></svg>'
  },
  {
    _id: 'USR-MGR-01',
    id: 'USR-MGR-01',
    name: 'Operations Manager',
    email: 'manager@aureliagrand.com',
    password: '$2a$10$e0MYzXyjpJS7Pd0RVvHwHeFj5d7KjK8D2mQzG1a.X1H1e1a1e1a1e',
    rawPassword: 'managerpassword123',
    role: 'Manager',
    department: 'Executive Operations',
    avatar: 'data:image/svg+xml;utf8,<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><circle cx="64" cy="64" r="64" fill="%23E2E8F0"/><circle cx="64" cy="46" r="22" fill="%23718096"/><path d="M22 108C22 84.804 40.804 66 64 66C87.196 66 106 84.804 106 108V114C106 114 90 124 64 124C38 124 22 114 22 114V108Z" fill="%23718096"/></svg>'
  },
  {
    _id: 'USR-STAFF-01',
    id: 'USR-STAFF-01',
    name: 'Front Desk Lead',
    email: 'staff@aureliagrand.com',
    password: '$2a$10$e0MYzXyjpJS7Pd0RVvHwHeFj5d7KjK8D2mQzG1a.X1H1e1a1e1a1e',
    rawPassword: 'staffpassword123',
    role: 'Staff',
    department: 'Front Desk',
    avatar: 'data:image/svg+xml;utf8,<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><circle cx="64" cy="64" r="64" fill="%23E2E8F0"/><circle cx="64" cy="46" r="22" fill="%23718096"/><path d="M22 108C22 84.804 40.804 66 64 66C87.196 66 106 84.804 106 108V114C106 114 90 124 64 124C38 124 22 114 22 114V108Z" fill="%23718096"/></svg>'
  }
];

export const findUserByEmail = async (identifier) => {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();
  try {
    if (mongoose.connection.readyState === 1) {
      return await User.findOne({
        $or: [{ email: clean }, { username: clean }]
      }).select('+password');
    }
  } catch (err) {
    console.warn('MongoDB query warning, using fallback store:', err.message);
  }
  const found = inMemoryUsers.find(
    (u) =>
      (u.email && u.email.toLowerCase() === clean) ||
      (u.username && u.username.toLowerCase() === clean) ||
      (u.role && u.role.toLowerCase() === clean) ||
      (u.name && u.name.toLowerCase().replace(/\s+/g, '') === clean)
  );
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

export const createUser = async ({ name, email, password, role = 'Guest', department = 'General', avatar }) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.create({ name, email, password, role, department, avatar });
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
    department,
    avatar: avatar || 'data:image/svg+xml;utf8,<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><circle cx="64" cy="64" r="64" fill="%23E2E8F0"/><circle cx="64" cy="46" r="22" fill="%23718096"/><path d="M22 108C22 84.804 40.804 66 64 66C87.196 66 106 84.804 106 108V114C106 114 90 124 64 124C38 124 22 114 22 114V108Z" fill="%23718096"/></svg>'
  };
  inMemoryUsers.push(newUser);
  return newUser;
};
