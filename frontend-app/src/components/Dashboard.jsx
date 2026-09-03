import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { exportToCSV, printPDFReport } from '../utils/reportExporter';
import { ConfirmModal } from './ConfirmModal';
import { EmptyState } from './EmptyState';
import {
  IconDollarSign,
  IconBed,
  IconUsers,
  IconTrendingUp,
  IconCheckCircle,
  IconPlus,
  IconPrinter,
  IconX,
  IconCalendar,
  IconCrown
} from './Icons';

// Custom Responsive Real-Time SVG Area Chart
const RealtimeAreaChart = ({ data }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!data || data.length === 0) return null;

  const width = 500;
  const height = 200;
  const padding = 30;

  const maxVal = Math.max(...data.map((d) => d.revenue), 60000);
  const minVal = 0;

  const points = data.map((d, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((d.revenue - minVal) / (maxVal - minVal)) * (height - padding * 2);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, point, i) => {
    return i === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="relative w-full h-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 overflow-visible">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal Gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const y = height - padding - pct * (height - padding * 2);
          return (
            <line
              key={i}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#1E293B"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Filled Area */}
        <path d={areaD} fill="url(#areaGradient)" />

        {/* Line Stroke */}
        <path d={pathD} fill="none" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" />

        {/* Data Circles & Hover Points */}
        {points.map((p, i) => (
          <g key={i} className="cursor-pointer">
            <circle
              cx={p.x}
              cy={p.y}
              r={hoveredPoint?.month === p.month ? 6 : 4}
              fill="#D4AF37"
              stroke="#0B0F19"
              strokeWidth="2"
              onMouseEnter={() => setHoveredPoint(p)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
            {/* X Axis Labels */}
            <text
              x={p.x}
              y={height - 8}
              textAnchor="middle"
              fill="#64748B"
              fontSize="10"
              fontWeight="500"
            >
              {p.month}
            </text>
          </g>
        ))}
      </svg>

      {/* Interactive Tooltip Popover */}
      {hoveredPoint && (
        <div
          className="absolute z-20 bg-slate-950 border border-slate-800 rounded-xl p-2.5 shadow-xl text-xs space-y-1 pointer-events-none"
          style={{
            left: `${(hoveredPoint.x / width) * 100}%`,
            top: `${(hoveredPoint.y / height) * 100}%`,
            transform: 'translate(-50%, -120%)'
          }}
        >
          <div className="font-bold text-slate-100">{hoveredPoint.month}</div>
          <div className="text-amber-400 font-extrabold">${hoveredPoint.revenue.toLocaleString()}</div>
          <div className="text-[10px] text-slate-400">{hoveredPoint.bookings} Bookings • {hoveredPoint.occupancy}% Occupancy</div>
        </div>
      )}
    </div>
  );
};

// Custom Donut Inventory Chart
const RealtimeDonutChart = ({ distribution }) => {
  const total = distribution.reduce((acc, curr) => acc + curr.value, 0);
  let accumulatedAngle = 0;

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          {distribution.map((item, index) => {
            const percentage = total > 0 ? item.value / total : 0;
            const strokeDasharray = `${percentage * 283} 283`;
            const strokeDashoffset = -accumulatedAngle * 283;
            accumulatedAngle += percentage;

            return (
              <circle
                key={index}
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                stroke={item.color}
                strokeWidth="10"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500 hover:opacity-80"
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-extrabold text-slate-100">{total}</span>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Total Rooms</span>
        </div>
      </div>

      {/* Legend Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs w-full pt-2 border-t border-slate-800">
        {distribution.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-slate-300 font-medium">{item.name}:</span>
            <span className="font-bold text-slate-100">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Custom Bar Chart for Weekly Activity
const RealtimeBarChart = ({ weeklyActivity }) => {
  const maxVal = Math.max(
    ...weeklyActivity.map((w) => Math.max(w.checkIns, w.checkOuts)),
    35
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-4 text-xs font-medium text-slate-400 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-500" />
          <span>Check-Ins</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-500" />
          <span>Check-Outs</span>
        </div>
      </div>

      <div className="h-40 flex items-end justify-between gap-2 pt-4 px-2 border-b border-slate-800">
        {weeklyActivity.map((item, index) => {
          const checkInHeight = (item.checkIns / maxVal) * 100;
          const checkOutHeight = (item.checkOuts / maxVal) * 100;

          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
              <div className="flex items-end gap-1 w-full justify-center h-full">
                <div
                  className="w-3 bg-emerald-500 rounded-t transition-all group-hover:bg-emerald-400"
                  style={{ height: `${checkInHeight}%` }}
                  title={`Check-Ins: ${item.checkIns}`}
                />
                <div
                  className="w-3 bg-blue-500 rounded-t transition-all group-hover:bg-blue-400"
                  style={{ height: `${checkOutHeight}%` }}
                  title={`Check-Outs: ${item.checkOuts}`}
                />
              </div>
              <span className="text-[10px] text-slate-400 font-medium">{item.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Dashboard = ({ onOpenNewBookingModal }) => {
  const {
    metrics,
    rooms = [],
    bookings = [],
    currentUser,
    userRole,
    checkInGuest,
    checkOutGuest,
    cancelBooking,
    deleteBooking,
    updateRoomStatus,
    setSelectedInvoice,
    isSocketConnected
  } = useHotel();

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    type: 'danger',
    onConfirm: null
  });

  const triggerCancelConfirm = (booking) => {
    setConfirmModal({
      isOpen: true,
      title: 'Cancel Reservation',
      message: `Are you sure you want to cancel reservation ${booking.id} for ${booking.guestName}? Room ${booking.roomNumber} will be freed up.`,
      confirmText: 'Cancel Booking',
      type: 'danger',
      onConfirm: () => {
        cancelBooking(booking.id);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  const triggerDeleteConfirm = (booking) => {
    setConfirmModal({
      isOpen: true,
      title: 'Permanently Delete Reservation',
      message: `Are you sure you want to PERMANENTLY DELETE reservation ${booking.id} for ${booking.guestName}? This record will be permanently removed.`,
      confirmText: 'Delete Permanently',
      type: 'danger',
      onConfirm: () => {
        deleteBooking(booking.id);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  const triggerCheckOutConfirm = (booking) => {
    setConfirmModal({
      isOpen: true,
      title: 'Check-Out Guest',
      message: `Complete check-out process for ${booking.guestName} (Room ${booking.roomNumber})? Room status will transition to Cleaning.`,
      confirmText: 'Check Out Guest',
      type: 'warning',
      onConfirm: () => {
        checkOutGuest(booking.id);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  const checkedInBookings = bookings.filter((b) => b.status === 'Checked-In');

  const totalRevenueFormatted = (metrics?.totalRevenue || 0).toLocaleString();
  const occupancyRate = metrics?.occupancyRate || 0;
  const occupiedCount = metrics?.occupiedRoomsCount || 0;
  const totalCount = metrics?.totalRoomsCount || 0;
  const availableCount = metrics?.availableRoomsCount || 0;
  const reservedCount = metrics?.reservedRoomsCount || 0;
  const cleaningCount = metrics?.cleaningRoomsCount || 0;

  const revenueTimeline = metrics?.revenueTimeline || [];
  const weeklyActivity = metrics?.weeklyActivity || [];
  const roomDistribution = metrics?.roomDistribution || [
    { name: 'Available', value: availableCount, color: '#10B981' },
    { name: 'Occupied', value: occupiedCount, color: '#EF4444' },
    { name: 'Reserved', value: reservedCount, color: '#F59E0B' },
    { name: 'Cleaning', value: cleaningCount, color: '#3B82F6' }
  ];

  const handleExportDashboardCSV = () => {
    exportToCSV(
      'Aurelia_Resort_Revenue_Occupancy_Report',
      bookings.map((b) => ({
        BookingID: b.id,
        GuestName: b.guestName,
        RoomNumber: b.roomNumber,
        Category: b.roomCategory,
        Status: b.status,
        PaymentStatus: b.paymentStatus || 'Paid',
        TotalAmount: `$${b.totalAmount}`
      }))
    );
  };

  const handlePrintDashboardPDF = () => {
    printPDFReport(
      'Executive Occupancy & Financial Summary Report',
      [
        { label: 'Total Revenue', value: `$${totalRevenueFormatted}` },
        { label: 'Occupancy Rate', value: `${occupancyRate}%` },
        { label: 'Total Rooms', value: totalCount },
        { label: 'Available Rooms', value: availableCount }
      ],
      bookings.slice(0, 10).map((b) => ({
        ID: b.id,
        Guest: b.guestName,
        Room: b.roomNumber,
        Status: b.status,
        Amount: `$${b.totalAmount}`
      }))
    );
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Welcome Banner with Logged-in Admin / Staff Profile Info */}
      <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative flex-shrink-0">
            <img
              src={currentUser?.avatar || 'data:image/svg+xml;utf8,<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><circle cx="64" cy="64" r="64" fill="%23E2E8F0"/><circle cx="64" cy="46" r="22" fill="%23718096"/><path d="M22 108C22 84.804 40.804 66 64 66C87.196 66 106 84.804 106 108V114C106 114 90 124 64 124C38 124 22 114 22 114V108Z" fill="%23718096"/></svg>'}
              alt={currentUser?.name || 'Administrator'}
              className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 shadow-md shadow-amber-500/20"
            />
            <span className="absolute -bottom-1 -right-1 p-0.5 bg-slate-950 border border-amber-400 rounded-full text-amber-400">
              <IconCrown size={10} />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-base sm:text-lg font-bold text-slate-100">
                Welcome back, {currentUser?.name || 'Administrator'}
              </h2>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase">
                {currentUser?.role || (userRole || 'Admin')}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {currentUser?.email || 'Operations Console'} • Live Resort Management Dashboard
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            System Live & Ready
          </span>
        </div>
      </div>

      {/* Executive Report Export Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-900/80 border border-slate-800 p-3 sm:p-4 rounded-xl gap-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          <span className="text-xs font-bold text-slate-200">Executive Report Center</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-start sm:justify-end">
          <button
            onClick={handleExportDashboardCSV}
            className="bg-slate-950 hover:bg-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300 transition-all min-h-[34px]"
          >
            Export CSV
          </button>
          <button
            onClick={handlePrintDashboardPDF}
            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 min-h-[34px]"
          >
            <IconPrinter size={14} /> <span>Print PDF Report</span>
          </button>
        </div>
      </div>

      {/* Top KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-sm hover:border-slate-700 transition-all hover-card-lift">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Revenue</span>
            <div className="text-2xl font-bold text-amber-400">${totalRevenueFormatted}</div>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium pt-1">
              <IconTrendingUp size={14} />
              <span>+18.4% real-time</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <IconDollarSign size={24} />
          </div>
        </div>

        {/* Occupancy Rate Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-sm hover:border-slate-700 transition-all hover-card-lift">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Occupancy Rate</span>
            <div className="text-2xl font-bold text-emerald-400">{occupancyRate}%</div>
            <div className="flex items-center gap-1 text-xs text-slate-400 pt-1">
              <IconTrendingUp size={14} className="text-emerald-400" />
              <span>{occupiedCount} / {totalCount} Occupied</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <IconBed size={24} />
          </div>
        </div>

        {/* Available Rooms Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-sm hover:border-slate-700 transition-all">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Available Rooms</span>
            <div className="text-2xl font-bold text-blue-400">{availableCount}</div>
            <div className="text-xs text-slate-400 pt-1">
              {reservedCount} Reserved • {cleaningCount} Cleaning
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <IconCheckCircle size={24} />
          </div>
        </div>

        {/* In-House Guests Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-sm hover:border-slate-700 transition-all">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">In-House Guests</span>
            <div className="text-2xl font-bold text-purple-400">{checkedInBookings.length}</div>
            <div className="flex items-center gap-1 text-xs text-purple-300 pt-1">
              <IconUsers size={14} />
              <span>VIP Concierge Active</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <IconUsers size={24} />
          </div>
        </div>
      </div>

      {/* Real-Time Interactive Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-Time Revenue Trajectory Chart (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Real-Time Revenue Trajectory</h2>
              <p className="text-xs text-slate-400">Live monthly growth & WebSocket stream projection</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              Live Chart
            </span>
          </div>

          <div className="pt-2">
            <RealtimeAreaChart data={revenueTimeline} />
          </div>
        </div>

        {/* Room Status Distribution Donut Chart (1 col) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100 mb-1">Room Status Inventory</h2>
            <p className="text-xs text-slate-400 mb-4">Live breakdown across all hotel tiers</p>

            <RealtimeDonutChart distribution={roomDistribution} />
          </div>
        </div>
      </div>

      {/* Weekly Activity Bar Chart & Live Room Availability Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Room Availability Matrix */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Live Room Availability Matrix</h2>
              <p className="text-xs text-slate-400">Click any room tile to instantly toggle status & emit WebSockets</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">● Available</span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">● Occupied</span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">● Reserved</span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">● Cleaning</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {rooms.map((room) => {
              const statusColors = {
                Available: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20',
                Occupied: 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20',
                Reserved: 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20',
                Cleaning: 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20'
              };
              const badgeClass = statusColors[room.status] || 'bg-slate-800 text-slate-300 border-slate-700';

              return (
                <div
                  key={room.id}
                  onClick={() => {
                    const nextStatus =
                      room.status === 'Available' ? 'Occupied' : room.status === 'Occupied' ? 'Cleaning' : 'Available';
                    updateRoomStatus(room.number, nextStatus);
                  }}
                  className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-center cursor-pointer transition-all hover:scale-[1.02] hover:border-slate-700 flex flex-col justify-between"
                >
                  <div>
                    <div className="text-lg font-extrabold text-amber-400 mb-0.5">#{room.number}</div>
                    <div className="text-xs text-slate-400 mb-2 font-medium truncate">{room.category}</div>
                  </div>
                  <div className="space-y-2">
                    <span className={`inline-block w-full py-1 text-[11px] font-semibold rounded-md border ${badgeClass}`}>
                      {room.status}
                    </span>
                    <div className="text-xs font-semibold text-slate-300">${room.price}<span className="text-[10px] text-slate-500">/night</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Activity Bar Chart */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100 mb-1">Weekly Guest Traffic</h2>
            <p className="text-xs text-slate-400 mb-4">Check-Ins vs Check-Outs volume</p>

            <RealtimeBarChart weeklyActivity={weeklyActivity} />
          </div>
        </div>
      </div>

      {/* Recent Reservations Table Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Active & Upcoming Guests</h2>
            <p className="text-xs text-slate-400">Clean, real-time check-in and receipt management</p>
          </div>

          <button
            onClick={onOpenNewBookingModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-auto"
          >
            <IconPlus size={15} /> Express Booking
          </button>
        </div>

        {bookings.length === 0 ? (
          <EmptyState
            title="No Active Reservations"
            message="There are currently no active or upcoming guest reservations recorded in the system."
            actionText="Create Express Booking"
            onAction={onOpenNewBookingModal}
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800 responsive-table-wrapper">
            <table className="w-full min-w-[700px] text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Booking ID</th>
                  <th className="py-3.5 px-4">Guest Details</th>
                  <th className="py-3.5 px-4">Room</th>
                  <th className="py-3.5 px-4">Dates</th>
                  <th className="py-3.5 px-4">Bill</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                {bookings.slice(0, 6).map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-amber-400">{booking.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-100">{booking.guestName}</div>
                      <div className="text-[11px] text-slate-400">{booking.guestEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      Room {booking.roomNumber}
                      <span className="block text-[11px] text-slate-400 font-normal">{booking.roomCategory}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div>{booking.checkIn} → {booking.checkOut}</div>
                      <span className="text-[10px] text-slate-400 font-medium">{booking.totalNights} Nights</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">${(booking?.totalAmount || 0).toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          booking.status === 'Checked-In'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : booking.status === 'Confirmed'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : booking.status === 'Checked-Out'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Check-In Primary Action (Green) */}
                        {booking.status === 'Confirmed' && (
                          <button
                            onClick={() => checkInGuest(booking.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1"
                          >
                            Check In
                          </button>
                        )}

                        {/* Check-Out Action (Red / Rose Danger with Confirm Modal) */}
                        {booking.status === 'Checked-In' && (
                          <button
                            onClick={() => triggerCheckOutConfirm(booking)}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-all"
                          >
                            Check Out
                          </button>
                        )}

                        {/* Receipt Action (Grey Secondary) */}
                        <button
                          onClick={() => setSelectedInvoice(booking)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs px-3 py-1.5 rounded-lg border border-slate-700 shadow-sm transition-all flex items-center gap-1"
                        >
                          <IconPrinter size={13} /> Receipt
                        </button>

                        {/* Cancel Action (Red Danger with Confirm Modal) */}
                        {booking.status !== 'Cancelled' && booking.status !== 'Checked-Out' && (
                          <button
                            onClick={() => triggerCancelConfirm(booking)}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-2.5 py-1.5 rounded-lg shadow-sm transition-all"
                            title="Cancel Reservation"
                          >
                            Cancel
                          </button>
                        )}

                        {/* Delete Action (Red Danger with Confirm Modal) */}
                        <button
                          onClick={() => triggerDeleteConfirm(booking)}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-2.5 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1"
                          title="Delete Reservation Permanently"
                        >
                          <IconX size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
