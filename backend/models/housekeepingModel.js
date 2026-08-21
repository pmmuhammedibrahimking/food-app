import mongoose from 'mongoose';

const housekeepingSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    roomNumber: {
      type: String,
      required: [true, 'Please specify room number'],
      trim: true
    },
    type: {
      type: String,
      default: 'Departure Turnaround Clean'
    },
    assignee: {
      type: String,
      default: 'Unassigned'
    },
    priority: {
      type: String,
      enum: ['High', 'Normal', 'Urgent', 'Low'],
      default: 'High'
    },
    status: {
      type: String,
      enum: ['Pending', 'Assigned', 'Cleaning', 'Inspection', 'Completed'],
      default: 'Pending'
    },
    notes: {
      type: String,
      default: ''
    },
    completedTimestamp: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const HousekeepingTask = mongoose.model('HousekeepingTask', housekeepingSchema);

// In-Memory Fallback Seed Tasks
export let initialHousekeepingStore = [
  {
    id: 'HK-101',
    roomNumber: '202',
    type: 'Departure Turnaround Clean',
    assignee: 'Maria Garcia',
    priority: 'High',
    status: 'Cleaning',
    notes: 'Guest checked out at 11 AM. Deep clean and replace linens required.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'HK-102',
    roomNumber: '101',
    type: 'Daily Linen Refill & Restock',
    assignee: 'Elena Rostova',
    priority: 'Normal',
    status: 'Assigned',
    notes: 'Refill complimentary mini-bar and espresso capsules.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'HK-103',
    roomNumber: '302',
    type: 'VIP Sanitation Inspection',
    assignee: 'Sarah Jenkins',
    priority: 'Urgent',
    status: 'Inspection',
    notes: 'VIP guest arrival at 3 PM. Final inspection required.',
    createdAt: new Date().toISOString()
  }
];
