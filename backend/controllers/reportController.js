import mongoose from 'mongoose';
import { Booking, initialBookingsStore } from '../models/bookingModel.js';
import { Room, initialRoomsStore } from '../models/roomModel.js';
import { Guest, initialGuestsStore } from '../models/guestModel.js';
import { HousekeepingTask, initialHousekeepingStore } from '../models/housekeepingModel.js';
import { getAllOrders } from '../models/roomServiceModel.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * @desc    Get Aggregated Hotel Operational Reports (MongoDB Real-Time Data)
 * @route   GET /api/reports
 * @access  Private / Staff (Manager / Admin)
 */
export const getReportData = async (req, res) => {
  try {
    const { type = 'Revenue', startDate, endDate, category = 'All', status = 'All' } = req.query;

    let bookingsList = initialBookingsStore;
    let roomsList = initialRoomsStore;
    let guestsList = initialGuestsStore;
    let housekeepingList = initialHousekeepingStore;
    let diningOrders = getAllOrders();

    if (mongoose.connection.readyState === 1) {
      try {
        bookingsList = await Booking.find({});
        roomsList = await Room.find({});
        guestsList = await Guest.find({});
        housekeepingList = await HousekeepingTask.find({});
      } catch (e) {
        console.warn('MongoDB query warning for reports, falling back to stores:', e.message);
      }
    }

    // Filter by Date Range if provided
    let start = startDate ? new Date(startDate) : new Date(0);
    let end = endDate ? new Date(endDate) : new Date('2099-12-31');

    const isDateInRange = (dateStr) => {
      if (!dateStr) return true;
      const d = new Date(dateStr);
      return d >= start && d <= end;
    };

    let reportTitle = '';
    let summaryMetrics = [];
    let chartData = [];
    let rows = [];

    switch (type) {
      case 'Revenue':
        reportTitle = 'Revenue & Financial Analytics Report';
        const validBookings = bookingsList.filter((b) => b.status !== 'Cancelled' && isDateInRange(b.checkIn));
        const roomRev = validBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        const diningRev = diningOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const totalRev = roomRev + diningRev;
        const avgDailyRate = validBookings.length > 0 ? Math.round(roomRev / validBookings.length) : 0;

        summaryMetrics = [
          { label: 'Total Revenue', value: `$${totalRev.toLocaleString()}` },
          { label: 'Room Revenue', value: `$${roomRev.toLocaleString()}` },
          { label: 'Dining Revenue', value: `$${diningRev.toLocaleString()}` },
          { label: 'Average Daily Rate (ADR)', value: `$${avgDailyRate}` }
        ];

        // Chart aggregation by category
        const revByCategory = {};
        validBookings.forEach((b) => {
          const cat = b.roomCategory || 'Suite';
          revByCategory[cat] = (revByCategory[cat] || 0) + (b.totalAmount || 0);
        });

        chartData = Object.keys(revByCategory).map((cat) => ({
          name: cat,
          value: revByCategory[cat]
        }));

        rows = validBookings.map((b) => ({
          bookingId: b.id,
          guestName: b.guestName,
          room: `Room ${b.roomNumber} (${b.roomCategory || 'Suite'})`,
          checkIn: b.checkIn,
          checkOut: b.checkOut,
          amount: `$${b.totalAmount}`,
          paymentStatus: b.paymentStatus || 'Paid'
        }));
        break;

      case 'Reservations':
        reportTitle = 'Reservations & Booking Channels Report';
        let filteredBookings = bookingsList.filter((b) => isDateInRange(b.checkIn));
        if (status !== 'All') filteredBookings = filteredBookings.filter((b) => b.status === status);

        const confirmedCount = filteredBookings.filter((b) => b.status === 'Confirmed' || b.status === 'Checked-In').length;
        const checkedOutCount = filteredBookings.filter((b) => b.status === 'Checked-Out').length;

        summaryMetrics = [
          { label: 'Total Bookings', value: filteredBookings.length.toString() },
          { label: 'Confirmed & Checked-In', value: confirmedCount.toString() },
          { label: 'Completed Stays', value: checkedOutCount.toString() },
          { label: 'Completion Rate', value: `${filteredBookings.length > 0 ? Math.round((checkedOutCount / filteredBookings.length) * 100) : 100}%` }
        ];

        const statusCounts = {};
        filteredBookings.forEach((b) => {
          statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
        });

        chartData = Object.keys(statusCounts).map((st) => ({
          name: st,
          value: statusCounts[st]
        }));

        rows = filteredBookings.map((b) => ({
          bookingId: b.id,
          guestName: b.guestName,
          roomNumber: b.roomNumber,
          dates: `${b.checkIn} to ${b.checkOut}`,
          status: b.status,
          totalAmount: `$${b.totalAmount}`
        }));
        break;

      case 'Occupancy':
        reportTitle = 'Resort Sanctuary Occupancy Matrix';
        const totalRooms = roomsList.length;
        const occupied = roomsList.filter((r) => r.status === 'Occupied').length;
        const reserved = roomsList.filter((r) => r.status === 'Reserved').length;
        const available = roomsList.filter((r) => r.status === 'Available').length;
        const occRate = totalRooms > 0 ? Math.round(((occupied + reserved) / totalRooms) * 100) : 0;

        summaryMetrics = [
          { label: 'Total Rooms', value: totalRooms.toString() },
          { label: 'Occupancy Rate', value: `${occRate}%` },
          { label: 'Currently Occupied', value: occupied.toString() },
          { label: 'Available Sanctuaries', value: available.toString() }
        ];

        chartData = [
          { name: 'Occupied', value: occupied },
          { name: 'Reserved', value: reserved },
          { name: 'Available', value: available },
          { name: 'Cleaning', value: roomsList.filter((r) => r.status === 'Cleaning').length }
        ];

        rows = roomsList.map((r) => ({
          roomNumber: r.number,
          roomName: r.name,
          category: r.category,
          pricePerNight: `$${r.price}`,
          floor: r.floor,
          status: r.status
        }));
        break;

      case 'Payments':
        reportTitle = 'Payments & Billing Gateway Audit Report';
        const paidBookings = bookingsList.filter((b) => b.paymentStatus === 'Paid');
        const pendingBookings = bookingsList.filter((b) => b.paymentStatus === 'Pending' || !b.paymentStatus);
        const paidSum = paidBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        const pendingSum = pendingBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        summaryMetrics = [
          { label: 'Collected Payments', value: `$${paidSum.toLocaleString()}` },
          { label: 'Pending Receivables', value: `$${pendingSum.toLocaleString()}` },
          { label: 'Paid Reservations', value: paidBookings.length.toString() },
          { label: 'Pending Invoice Count', value: pendingBookings.length.toString() }
        ];

        chartData = [
          { name: 'Paid Revenue', value: paidSum },
          { name: 'Pending Revenue', value: pendingSum }
        ];

        rows = bookingsList.map((b) => ({
          invoiceId: `INV-${b.id}`,
          guestName: b.guestName,
          amount: `$${b.totalAmount}`,
          paymentStatus: b.paymentStatus || 'Paid',
          gateway: b.id.includes('RAZ') ? 'Razorpay (UPI)' : 'Stripe (Card)'
        }));
        break;

      case 'Guests':
        reportTitle = 'Guest Demographics & CRM Report';
        const totalGuests = guestsList.length;
        const vipCount = guestsList.filter((g) => g.vipStatus === 'Gold' || g.vipStatus === 'Platinum' || g.vipStatus === 'Diamond' || g.isVip).length;

        summaryMetrics = [
          { label: 'Total Registered Guests', value: totalGuests.toString() },
          { label: 'VIP Guests', value: vipCount.toString() },
          { label: 'Active Guest Profiles', value: guestsList.filter((g) => g.status === 'Checked-In' || g.status === 'Active').length.toString() },
          { label: 'VIP Ratio', value: `${totalGuests > 0 ? Math.round((vipCount / totalGuests) * 100) : 0}%` }
        ];

        const vipDistribution = {};
        guestsList.forEach((g) => {
          const tier = g.vipStatus || 'Standard';
          vipDistribution[tier] = (vipDistribution[tier] || 0) + 1;
        });

        chartData = Object.keys(vipDistribution).map((tier) => ({
          name: `${tier} Tier`,
          value: vipDistribution[tier]
        }));

        rows = guestsList.map((g) => ({
          id: g.id,
          name: g.name,
          email: g.email || 'N/A',
          phone: g.phone || 'N/A',
          vipStatus: g.vipStatus || 'Standard',
          totalStays: g.totalStays || 1
        }));
        break;

      case 'RoomPerformance':
        reportTitle = 'Room Category Performance & Yield Analysis';
        const catPerformance = {};
        roomsList.forEach((r) => {
          if (!catPerformance[r.category]) {
            catPerformance[r.category] = { count: 0, totalRev: 0, occupied: 0 };
          }
          catPerformance[r.category].count += 1;
          if (r.status === 'Occupied') catPerformance[r.category].occupied += 1;
        });

        bookingsList.forEach((b) => {
          const cat = b.roomCategory || 'Suite';
          if (catPerformance[cat]) {
            catPerformance[cat].totalRev += b.totalAmount || 0;
          }
        });

        summaryMetrics = [
          { label: 'Top Performing Tier', value: 'Penthouse & Villa' },
          { label: 'Total Room Categories', value: Object.keys(catPerformance).length.toString() },
          { label: 'Average Revenue per Category', value: `$${Math.round(bookingsList.reduce((s, b) => s + (b.totalAmount || 0), 0) / (Object.keys(catPerformance).length || 1)).toLocaleString()}` }
        ];

        chartData = Object.keys(catPerformance).map((cat) => ({
          name: cat,
          value: catPerformance[cat].totalRev
        }));

        rows = Object.keys(catPerformance).map((cat) => ({
          category: cat,
          totalRooms: catPerformance[cat].count,
          currentlyOccupied: catPerformance[cat].occupied,
          generatedRevenue: `$${catPerformance[cat].totalRev.toLocaleString()}`
        }));
        break;

      case 'Housekeeping':
      default:
        reportTitle = 'Housekeeping & Maintenance Operations Report';
        const totalTasks = housekeepingList.length;
        const completedTasks = housekeepingList.filter((h) => h.status === 'Completed').length;
        const pendingTasks = housekeepingList.filter((h) => h.status !== 'Completed').length;

        summaryMetrics = [
          { label: 'Total Cleaning Tasks', value: totalTasks.toString() },
          { label: 'Completed Turnarounds', value: completedTasks.toString() },
          { label: 'Pending In-Progress Tasks', value: pendingTasks.toString() },
          { label: 'Housekeeping Turnaround Rate', value: `${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100}%` }
        ];

        chartData = [
          { name: 'Completed', value: completedTasks },
          { name: 'Pending', value: housekeepingList.filter((h) => h.status === 'Pending').length },
          { name: 'Cleaning', value: housekeepingList.filter((h) => h.status === 'Cleaning' || h.status === 'Assigned').length }
        ];

        rows = housekeepingList.map((h) => ({
          taskId: h.id,
          roomNumber: h.roomNumber,
          type: h.type || 'Turnaround Clean',
          assignee: h.assignee || 'Unassigned',
          priority: h.priority || 'Normal',
          status: h.status
        }));
        break;
    }

    return successResponse(res, 200, 'Report generated successfully', {
      type,
      reportTitle,
      summaryMetrics,
      chartData,
      rows,
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Report controller error:', err);
    return errorResponse(res, 500, 'Failed to generate report data.');
  }
};
