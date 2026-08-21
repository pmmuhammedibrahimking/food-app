import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { IconCalendar, IconPlus, IconCrown, IconUsers, IconFilter, IconPrinter, IconX } from './Icons';

export const BookingCalendar = ({ onOpenNewBookingModal }) => {
  const { rooms = [], bookings = [], updateRoomStatus, setSelectedInvoice, addToast } = useHotel();

  // Date Navigation State (Start date for 14-day timeline matrix)
  const [startDateOffset, setStartDateOffset] = useState(0); // Offset in days from today
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [draggedBooking, setDraggedBooking] = useState(null);

  const categories = ['All', 'Suite', 'Penthouse', 'Executive', 'Villa', 'Standard'];

  // Helper to generate 14-day date columns array starting from offset
  const generateDates = () => {
    const dates = [];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + startDateOffset);

    for (let i = 0; i < 14; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = d.getDate();
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      const isToday = new Date().toISOString().split('T')[0] === dateStr;

      dates.push({ dateStr, dayName, dayNumber, monthName, isToday });
    }
    return dates;
  };

  const datesList = generateDates();

  // Filter rooms by category
  const filteredRooms = rooms.filter(
    (r) => selectedCategory === 'All' || r.category === selectedCategory
  );

  // Drag and Drop Handlers
  const handleDragStart = (e, booking) => {
    setDraggedBooking(booking);
    e.dataTransfer.setData('text/plain', booking.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Enable drop target
  };

  const handleDropOnCell = (e, roomNumber, targetDateStr) => {
    e.preventDefault();
    if (!draggedBooking) return;

    addToast(
      `Reservation ${draggedBooking.id} rescheduled to Room ${roomNumber} starting ${targetDateStr}!`,
      'success'
    );

    // Update room status
    updateRoomStatus(roomNumber, 'Reserved');
    setDraggedBooking(null);
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {/* Top Header & Navigation Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <IconCalendar size={22} />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-100 font-serif tracking-wide">
                Occupancy Calendar Matrix
              </h1>
              <p className="text-xs text-slate-400">
                14-Day PMS Room vs Date Timeline & Drag-and-Drop Rescheduling
              </p>
            </div>
          </div>

          {/* Timeline Navigation Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setStartDateOffset((prev) => prev - 7)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-all"
            >
              ◄ Prev 7 Days
            </button>
            <button
              onClick={() => setStartDateOffset(0)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-xs font-bold text-amber-400 hover:bg-amber-500/30 transition-all shadow-sm"
            >
              Today
            </button>
            <button
              onClick={() => setStartDateOffset((prev) => prev + 7)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-all"
            >
              Next 7 Days ►
            </button>
          </div>
        </div>

        {/* Filters & Color Legend Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          {/* Category Filter */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <IconFilter size={14} /> Filter Category:
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-1.5 rounded-xl focus:outline-none focus:border-amber-500/50 font-semibold"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-slate-900 text-slate-200">
                  {cat === 'All' ? 'All Room Categories' : `${cat} Tier`}
                </option>
              ))}
            </select>
          </div>

          {/* Color Status Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-300 bg-slate-950 p-2 rounded-xl border border-slate-800">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Occupied
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Reserved
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Maintenance
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Cleaning
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid Matrix Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            {/* Table Header: Dates Columns */}
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-xs select-none">
              <tr>
                {/* Room Info Header Column */}
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px] text-slate-300 w-52 sticky left-0 bg-slate-950 z-20 border-r border-slate-800">
                  Room & Tier
                </th>

                {/* 14 Date Header Columns */}
                {datesList.map((d, i) => (
                  <th
                    key={i}
                    className={`py-2 px-1 text-center font-semibold border-r border-slate-800/60 min-w-16 ${
                      d.isToday ? 'bg-amber-500/15 text-amber-400 font-extrabold' : ''
                    }`}
                  >
                    <div className="text-[10px] uppercase opacity-75">{d.dayName}</div>
                    <div className="text-sm font-bold">{d.dayNumber}</div>
                    <div className="text-[9px] text-slate-500">{d.monthName}</div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Matrix Body: Rooms vs Dates */}
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredRooms.map((room) => {
                return (
                  <tr key={room.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Room Info Sticky Left Column */}
                    <td className="py-3 px-4 sticky left-0 bg-slate-900 z-10 border-r border-slate-800 shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-amber-400 text-sm">Room {room.number}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">${room.price}/n</span>
                      </div>
                      <div className="text-[11px] font-semibold text-slate-200 truncate">{room.name}</div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                        <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-[9px]">
                          {room.category}
                        </span>
                        <span>• Status: {room.status}</span>
                      </div>
                    </td>

                    {/* Date Grid Cells for this Room */}
                    {datesList.map((d, colIndex) => {
                      const dateStr = d.dateStr;

                      // Check if room has active booking on this date
                      const activeBooking = bookings.find(
                        (b) =>
                          b.roomNumber === room.number &&
                          b.status !== 'Cancelled' &&
                          dateStr >= b.checkIn &&
                          dateStr <= b.checkOut
                      );

                      // Check if room status is Maintenance or Cleaning today
                      const isRoomMaintenance = room.status === 'Maintenance' && colIndex === 0;
                      const isRoomCleaning = room.status === 'Cleaning' && colIndex === 0;

                      return (
                        <td
                          key={colIndex}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDropOnCell(e, room.number, dateStr)}
                          onClick={() => {
                            if (!activeBooking) {
                              onOpenNewBookingModal(room);
                            }
                          }}
                          className={`p-1 border-r border-slate-800/50 align-middle text-center transition-colors relative min-w-16 h-16 ${
                            d.isToday ? 'bg-amber-500/5' : ''
                          } ${!activeBooking ? 'hover:bg-emerald-500/15 cursor-pointer' : ''}`}
                          title={
                            activeBooking
                              ? `${activeBooking.guestName} (${activeBooking.status})`
                              : `Click to book Room ${room.number} on ${dateStr}`
                          }
                        >
                          {/* Active Booking Bar Pill */}
                          {activeBooking ? (
                            <div
                              draggable={true}
                              onDragStart={(e) => handleDragStart(e, activeBooking)}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInvoice(activeBooking);
                              }}
                              className={`p-1.5 rounded-xl border text-[10px] font-bold truncate shadow-md cursor-grab active:cursor-grabbing transition-transform hover:scale-95 ${
                                activeBooking.status === 'Checked-In'
                                  ? 'bg-rose-600/90 text-white border-rose-400 shadow-rose-900/30'
                                  : activeBooking.status === 'Confirmed'
                                  ? 'bg-amber-500/90 text-slate-950 border-amber-300 shadow-amber-900/30'
                                  : 'bg-emerald-600/90 text-white border-emerald-400'
                              }`}
                            >
                              <div className="truncate font-extrabold">{activeBooking.guestName}</div>
                              <div className="text-[9px] opacity-80 font-mono truncate">{activeBooking.id}</div>
                            </div>
                          ) : isRoomMaintenance ? (
                            <div className="p-1 rounded-xl bg-purple-600/90 text-white font-bold border border-purple-400 text-[10px]">
                              Maintenance
                            </div>
                          ) : isRoomCleaning ? (
                            <div className="p-1 rounded-xl bg-blue-600/90 text-white font-bold border border-blue-400 text-[10px]">
                              Cleaning
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/40">
                                + Book
                              </span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
