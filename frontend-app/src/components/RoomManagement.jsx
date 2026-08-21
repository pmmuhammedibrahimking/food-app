import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { EmptyState } from './EmptyState';
import { ConfirmModal } from './ConfirmModal';
import { IconPlus, IconUsers, IconX, IconCalendar, IconDollarSign, IconWrench, IconBed } from './Icons';

export const RoomManagement = () => {
  const { rooms, bookings, updateRoomStatus, updateRoomPrice, addRoom, deleteRoom } = useHotel();
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [editingPriceRoom, setEditingPriceRoom] = useState(null);
  const [newPriceValue, setNewPriceValue] = useState('');
  const [activeCalendarRoom, setActiveCalendarRoom] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Delete Room',
    type: 'danger',
    onConfirm: null
  });

  const triggerDeleteRoomConfirm = (room) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Room',
      message: `Are you sure you want to delete Room #${room.number} (${room.name}) from inventory?`,
      confirmText: 'Delete Room',
      type: 'danger',
      onConfirm: () => {
        deleteRoom(room.number);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  const [newRoomForm, setNewRoomForm] = useState({
    number: '',
    name: '',
    category: 'Suite',
    floor: '1',
    price: 250,
    capacity: 2,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    amenities: 'King Bed, Ocean View, Free Wi-Fi, Mini Bar'
  });

  const categories = ['All', 'Suite', 'Penthouse', 'Executive', 'Villa', 'Standard'];
  const statuses = ['All', 'Available', 'Occupied', 'Maintenance', 'Reserved', 'Cleaning'];

  const filteredRooms = rooms.filter((room) => {
    const statusMatch = filterStatus === 'All' || room.status === filterStatus;
    const categoryMatch = filterCategory === 'All' || room.category === filterCategory;
    return statusMatch && categoryMatch;
  });

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!newRoomForm.number || !newRoomForm.name) return;

    const amenitiesArray = newRoomForm.amenities.split(',').map((a) => a.trim());
    addRoom({
      ...newRoomForm,
      price: Number(newRoomForm.price),
      capacity: Number(newRoomForm.capacity),
      amenities: amenitiesArray
    });

    setIsAddRoomModalOpen(false);
    setNewRoomForm({
      number: '',
      name: '',
      category: 'Suite',
      floor: '1',
      price: 250,
      capacity: 2,
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      amenities: 'King Bed, Ocean View, Free Wi-Fi, Mini Bar'
    });
  };

  const handleSavePrice = (e) => {
    e.preventDefault();
    if (!editingPriceRoom || !newPriceValue) return;

    updateRoomPrice(editingPriceRoom.number, newPriceValue);
    setEditingPriceRoom(null);
    setNewPriceValue('');
  };

  // Helper to generate 7-day mini calendar strip for a room
  const generateMiniCalendar = (roomNumber, roomStatus) => {
    const days = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

      // Check if room has an active booking for this date
      const activeBooking = bookings.find(
        (b) => b.roomNumber === roomNumber && b.status !== 'Cancelled' && dateStr >= b.checkIn && dateStr <= b.checkOut
      );

      let dayStatus = 'Available';
      if (roomStatus === 'Maintenance') dayStatus = 'Maintenance';
      else if (activeBooking) dayStatus = activeBooking.status === 'Checked-In' ? 'Occupied' : 'Reserved';
      else if (i === 0 && roomStatus === 'Occupied') dayStatus = 'Occupied';
      else if (i === 0 && roomStatus === 'Cleaning') dayStatus = 'Cleaning';

      days.push({ dayName, dateStr: date.getDate(), dayStatus });
    }
    return days;
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {statuses.map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterStatus === st
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="hidden sm:block h-6 w-px bg-slate-800" />

          {/* Category Dropdown Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500/50"
          >
            {categories.map((c) => (
              <option key={c} value={c} className="bg-slate-900 text-slate-200">
                Category: {c}
              </option>
            ))}
          </select>
        </div>

        {/* Primary Green Action */}
        <button
          onClick={() => setIsAddRoomModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all self-start md:self-auto"
        >
          <IconPlus size={16} /> Add New Room
        </button>
      </div>

      {/* Rooms Grid */}
      {filteredRooms.length === 0 ? (
        <EmptyState
          icon={IconBed}
          title="No Rooms Found"
          message="No rooms match your selected status or category filters."
          actionText="Reset Filters"
          onAction={() => {
            setFilterStatus('All');
            setFilterCategory('All');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredRooms.map((room) => {
          const badgeStyles = {
            Available: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            Occupied: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
            Maintenance: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            Reserved: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            Cleaning: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
          };
          const badgeClass = badgeStyles[room.status] || 'bg-slate-800 text-slate-400 border-slate-700';

          const miniCalendarDays = generateMiniCalendar(room.number, room.status);

          return (
            <div
              key={room.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image Header with Room Status Badge & Edit Price Button */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  {/* Status Badge: Available / Occupied / Maintenance */}
                  <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badgeClass}`}>
                    {room.status}
                  </span>

                  {/* Price Tag with Edit Price Button */}
                  <div className="absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-amber-400 border border-slate-800 flex items-center gap-2 shadow-lg">
                    <span>${room.price} <span className="text-[10px] text-slate-400 font-normal">/ night</span></span>
                    <button
                      onClick={() => {
                        setEditingPriceRoom(room);
                        setNewPriceValue(room.price);
                      }}
                      title="Edit Room Price"
                      className="p-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors"
                    >
                      <IconDollarSign size={13} />
                    </button>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-extrabold text-amber-400">Room {room.number}</span>
                    <span className="text-xs text-slate-400 font-semibold">Floor {room.floor}</span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-100">{room.name}</h3>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <IconUsers size={14} />
                    <span>Max Guests: {room.capacity}</span>
                    <span>•</span>
                    <span>{room.category}</span>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1.5">
                    {room.amenities.slice(0, 4).map((am, i) => (
                      <span key={i} className="bg-slate-950 text-slate-300 text-[10px] px-2 py-0.5 rounded-md border border-slate-800">
                        {am}
                      </span>
                    ))}
                  </div>

                  {/* Mini Occupancy Calendar Strip */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                        <IconCalendar size={13} /> Occupancy Calendar
                      </span>
                      <button
                        onClick={() => setActiveCalendarRoom(activeCalendarRoom?.number === room.number ? null : room)}
                        className="text-[10px] text-amber-400 hover:text-amber-300 font-bold underline"
                      >
                        {activeCalendarRoom?.number === room.number ? 'Hide View' : 'Full Schedule'}
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center">
                      {miniCalendarDays.map((d, idx) => {
                        const dayColors = {
                          Available: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                          Occupied: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
                          Maintenance: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
                          Reserved: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                          Cleaning: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        };
                        const colClass = dayColors[d.dayStatus] || 'bg-slate-800 text-slate-400';

                        return (
                          <div
                            key={idx}
                            title={`${d.dateStr}: ${d.dayStatus}`}
                            className={`p-1 rounded-lg border text-[10px] font-semibold ${colClass}`}
                          >
                            <div className="text-[9px] opacity-75">{d.dayName}</div>
                            <div>{d.dateStr}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer: Status Action & Maintenance Toggle */}
              <div className="p-4 bg-slate-950/60 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  {/* Maintenance Toggle Switch */}
                  <button
                    onClick={() => {
                      const nextStatus = room.status === 'Maintenance' ? 'Available' : 'Maintenance';
                      updateRoomStatus(room.number, nextStatus);
                    }}
                    className={`w-full py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border ${
                      room.status === 'Maintenance'
                        ? 'bg-purple-600 text-white border-purple-500 shadow-sm shadow-purple-500/20'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <IconWrench size={13} />
                    <span>{room.status === 'Maintenance' ? 'In Maintenance (Click to Clear)' : 'Set Maintenance'}</span>
                  </button>
                </div>

                {/* Status Dropdown Direct Action & Delete Room Button */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Status:</span>
                    <select
                      value={room.status}
                      onChange={(e) => updateRoomStatus(room.number, e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-xs text-slate-200 px-2.5 py-1 rounded-lg focus:outline-none focus:border-amber-500/50"
                    >
                      <option value="Available" className="bg-slate-900 text-emerald-400">Available</option>
                      <option value="Occupied" className="bg-slate-900 text-rose-400">Occupied</option>
                      <option value="Maintenance" className="bg-slate-900 text-purple-400">Maintenance</option>
                      <option value="Reserved" className="bg-slate-900 text-amber-400">Reserved</option>
                      <option value="Cleaning" className="bg-slate-900 text-blue-400">Cleaning</option>
                    </select>
                  </div>

                  <button
                    onClick={() => triggerDeleteRoomConfirm(room)}
                    className="bg-rose-600/90 hover:bg-rose-700 text-white font-semibold text-xs px-2.5 py-1 rounded-lg transition-all flex items-center gap-1"
                    title="Delete Room"
                  >
                    <IconX size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Expanded Occupancy Calendar View Drawer Modal */}
      {activeCalendarRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-100 space-y-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <IconCalendar size={20} className="text-amber-400" />
                <h2 className="text-base font-bold text-slate-100">
                  Occupancy Schedule — Room {activeCalendarRoom.number} ({activeCalendarRoom.name})
                </h2>
              </div>
              <button
                onClick={() => setActiveCalendarRoom(null)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800"
              >
                <IconX size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <div className="font-bold text-slate-200">Current Status: <span className="text-amber-400">{activeCalendarRoom.status}</span></div>
                  <div className="text-slate-400 text-[11px]">Nightly Rate: ${activeCalendarRoom.price}/night</div>
                </div>
                <button
                  onClick={() => {
                    const nextStatus = activeCalendarRoom.status === 'Maintenance' ? 'Available' : 'Maintenance';
                    updateRoomStatus(activeCalendarRoom.number, nextStatus);
                    setActiveCalendarRoom({ ...activeCalendarRoom, status: nextStatus });
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm"
                >
                  Toggle Maintenance
                </button>
              </div>

              <div className="font-bold text-slate-300">14-Day Reservation Timeline</div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 14 }).map((_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() + i);
                  const dateStr = date.toISOString().split('T')[0];
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

                  const booking = bookings.find(
                    (b) => b.roomNumber === activeCalendarRoom.number && b.status !== 'Cancelled' && dateStr >= b.checkIn && dateStr <= b.checkOut
                  );

                  return (
                    <div
                      key={i}
                      className={`p-2.5 rounded-xl border text-center space-y-1 ${
                        booking
                          ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                          : activeCalendarRoom.status === 'Maintenance'
                          ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                          : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      }`}
                    >
                      <div className="text-[10px] opacity-75">{dayName}</div>
                      <div className="font-extrabold text-sm">{date.getDate()}</div>
                      <div className="text-[9px] font-medium truncate">
                        {booking ? booking.guestName : activeCalendarRoom.status === 'Maintenance' ? 'Maintenance' : 'Available'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end p-4 border-t border-slate-800 bg-slate-950/40">
              <button
                onClick={() => setActiveCalendarRoom(null)}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl"
              >
                Close Calendar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Price Modal */}
      {editingPriceRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden text-slate-100 space-y-4">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <IconDollarSign size={18} className="text-amber-400" />
                <h2 className="text-sm font-bold text-slate-100">Edit Price — Room {editingPriceRoom.number}</h2>
              </div>
              <button
                onClick={() => setEditingPriceRoom(null)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
              >
                <IconX size={16} />
              </button>
            </div>

            <form onSubmit={handleSavePrice} className="p-4 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New Nightly Rate ($)</label>
                <input
                  type="number"
                  required
                  value={newPriceValue}
                  onChange={(e) => setNewPriceValue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-sm font-bold text-amber-400 px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500/50"
                  placeholder="e.g. 350"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPriceRoom(null)}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm"
                >
                  Save Price
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Room Modal */}
      {isAddRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-100 space-y-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h2 className="text-base font-bold text-slate-100">Add New Hotel Room</h2>
              <button
                onClick={() => setIsAddRoomModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
              >
                <IconX size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Room Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 501"
                    value={newRoomForm.number}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, number: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={newRoomForm.category}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="Suite">Suite</option>
                    <option value="Penthouse">Penthouse</option>
                    <option value="Executive">Executive</option>
                    <option value="Villa">Villa</option>
                    <option value="Standard">Standard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Room Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grand Horizon Panorama Suite"
                  value={newRoomForm.name}
                  onChange={(e) => setNewRoomForm({ ...newRoomForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Price Per Night ($)</label>
                  <input
                    type="number"
                    required
                    value={newRoomForm.price}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, price: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Max Guests</label>
                  <input
                    type="number"
                    required
                    value={newRoomForm.capacity}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, capacity: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddRoomModalOpen(false)}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl"
                >
                  Save Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
