import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { IconX, IconDollarSign, IconCrown, IconCalendar, IconBed, IconCheckCircle, IconSparkles, IconUsers } from './Icons';

export const NewBookingModal = ({ isOpen, onClose, defaultRoom = null }) => {
  const { rooms, addBooking, guests = [], sendGmailConfirmation, addToast } = useHotel();

  const availableRooms = rooms.filter((r) => r.status === 'Available' || (defaultRoom && r.number === defaultRoom.number));
  const initialRoom = defaultRoom || availableRooms[0] || rooms[0];

  const [activeStep, setActiveStep] = useState(1); // 1: Guest, 2: Room & Dates, 3: Payment & Extras

  const [formData, setFormData] = useState({
    guestName: 'Muhammed Ibrahim',
    guestEmail: 'pmmuhammedibrahim786@gmail.com',
    guestPhone: '+1 (555) 786-0199',
    roomNumber: initialRoom ? initialRoom.number : (rooms[0]?.number || '101'),
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    paymentStatus: 'Paid',
    paymentMethod: 'Stripe Card',
    specialRequests: 'Dom Pérignon champagne on arrival, Ocean view top floor suite',
    autoSendGmail: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const selectedRoomObj = rooms.find((r) => r.number === formData.roomNumber) || initialRoom || rooms[0];

  // Calculate nights
  const checkInDate = new Date(formData.checkIn);
  const checkOutDate = new Date(formData.checkOut);
  const diffTime = Math.max(1, checkOutDate - checkInDate);
  const totalNights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  
  const nightlyBaseRate = selectedRoomObj ? selectedRoomObj.price : 350;
  const baseTotal = nightlyBaseRate * totalNights;
  const resortTax = Math.round(baseTotal * 0.12);
  const cityTax = Math.round(baseTotal * 0.05);
  const vipDiscount = formData.guestEmail.includes('pmmuhammedibrahim') || formData.guestEmail.includes('royal') ? Math.round(baseTotal * 0.10) : 50;
  const totalAmount = Math.max(0, baseTotal + resortTax + cityTax - vipDiscount);

  const handleSelectVipGuest = (g) => {
    setFormData({
      ...formData,
      guestName: g.name,
      guestEmail: g.email,
      guestPhone: g.phone || '+1 (555) 019-2834',
      specialRequests: g.preferences || 'High floor suite, Champagne welcome'
    });
    if (addToast) addToast(`VIP Guest ${g.name} profile loaded!`, 'info');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.guestName || !formData.guestEmail || !formData.roomNumber) {
      if (addToast) addToast('Please provide guest name, email and select a room.', 'error');
      return;
    }

    setIsSubmitting(true);

    const newBookingObj = {
      ...formData,
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      roomCategory: selectedRoomObj ? selectedRoomObj.category : 'Suite',
      totalNights,
      totalAmount,
      status: 'Confirmed',
      createdAt: new Date().toISOString().split('T')[0]
    };

    addBooking(newBookingObj);

    if (formData.autoSendGmail && sendGmailConfirmation) {
      sendGmailConfirmation(newBookingObj);
    }

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl bg-slate-900/95 backdrop-blur-2xl border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh] animate-scale-up">
        {/* Top Luxury Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20 flex-shrink-0">
              <IconCrown size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-serif tracking-wide text-slate-100">
                  New Luxury Reservation
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 hidden sm:inline">
                  Concierge Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Book bespoke oceanfront sanctuaries, private pool villas & executive suites
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="px-6 py-2.5 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setActiveStep(1)}
            className={`flex items-center gap-2 font-bold transition-colors ${
              activeStep === 1 ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center ${activeStep === 1 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>1</span>
            <span>Guest Profile</span>
          </button>

          <span className="text-slate-700">→</span>

          <button
            type="button"
            onClick={() => setActiveStep(2)}
            className={`flex items-center gap-2 font-bold transition-colors ${
              activeStep === 2 ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center ${activeStep === 2 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>2</span>
            <span>Sanctuary & Dates</span>
          </button>

          <span className="text-slate-700">→</span>

          <button
            type="button"
            onClick={() => setActiveStep(3)}
            className={`flex items-center gap-2 font-bold transition-colors ${
              activeStep === 3 ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center ${activeStep === 3 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>3</span>
            <span>Payment & Folio</span>
          </button>
        </div>

        {/* Modal Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* STEP 1: GUEST PROFILE & FAST VIP SELECTOR */}
          {activeStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-1.5">
                <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  Quick-Fill VIP Guest Profile
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {guests.slice(0, 4).map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => handleSelectVipGuest(g)}
                      className={`p-2.5 rounded-xl border text-left transition-all group ${
                        formData.guestEmail === g.email
                          ? 'bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/10'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-100 group-hover:text-amber-400 truncate">
                        {g.name}
                      </div>
                      <div className="text-[10px] text-amber-400 font-semibold">{g.vipStatus} VIP</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Guest Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Muhammed Ibrahim"
                    value={formData.guestName}
                    onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Guest Gmail / Email</label>
                  <input
                    type="email"
                    required
                    placeholder="pmmuhammedibrahim786@gmail.com"
                    value={formData.guestEmail}
                    onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Contact Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 786-0199"
                    value={formData.guestPhone}
                    onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">VIP Tier / Loyalty Status</label>
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-2.5 rounded-xl text-amber-400 font-bold">
                    <IconSparkles size={16} />
                    <span>{formData.guestEmail.includes('pmmuhammedibrahim') ? 'Owner / Diamond Elite VIP' : 'Gold Tier VIP Member'}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Special Concierge Requests & Preferences</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Vintage Dom Pérignon on arrival, Late 3 PM checkout, hypoallergenic pillows"
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <span>Continue to Sanctuary Selection</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SANCTUARY SELECTION & DATES */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Select Room / Suite Sanctuary</label>
                <select
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 font-semibold"
                >
                  {rooms.map((room) => (
                    <option key={room.id} value={room.number} className="bg-slate-900 text-slate-100">
                      Room {room.number} • {room.name} ({room.category}) - ${room.price}/night [{room.status}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Suite Interactive Card */}
              {selectedRoomObj && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 flex flex-col sm:flex-row gap-4 items-center">
                  <img
                    src={selectedRoomObj.image}
                    alt={selectedRoomObj.name}
                    className="w-full sm:w-32 h-24 object-cover rounded-xl border border-slate-800"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="space-y-1 text-left flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        {selectedRoomObj.category}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Floor {selectedRoomObj.floor}</span>
                    </div>
                    <div className="font-bold text-sm text-slate-100">{selectedRoomObj.name}</div>
                    <div className="text-xs text-amber-400 font-extrabold">${selectedRoomObj.price} / night</div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {selectedRoomObj.amenities?.slice(0, 3).map((am, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                          ✓ {am}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Stay Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Check-In Date</label>
                  <input
                    type="date"
                    required
                    value={formData.checkIn}
                    onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Check-Out Date</label>
                  <input
                    type="date"
                    required
                    value={formData.checkOut}
                    onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-all"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <span>Review Folio & Payment</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT, BREAKDOWN & FOLIO */}
          {activeStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              {/* Payment Gateway Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Payment Gateway Option</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="Stripe Card">Stripe (Instant Card Auth)</option>
                    <option value="Razorpay UPI">Razorpay (Instant UPI QR)</option>
                    <option value="Pay at Desk">Pay at Concierge Front Desk</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Payment Status</label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="Paid">Paid (Full Prepayment)</option>
                    <option value="Pending">Pending (Pay on Arrival)</option>
                  </select>
                </div>
              </div>

              {/* Automatic Gmail Dispatch Toggle */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold">
                    📧
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-100">Send Instant Gmail Confirmation</div>
                    <div className="text-[10px] text-slate-400">Deliver digital folio directly to {formData.guestEmail}</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.autoSendGmail}
                  onChange={(e) => setFormData({ ...formData, autoSendGmail: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-400 focus:ring-amber-400/20 bg-slate-900 border-slate-700 cursor-pointer"
                />
              </div>

              {/* Live Price Calculation Folio */}
              <div className="bg-slate-950/90 border border-amber-500/30 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Base Rate (${nightlyBaseRate} × {totalNights} Nights):</span>
                  <span className="font-semibold text-slate-200">${baseTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Resort Occupancy Tax (12%):</span>
                  <span className="text-blue-400">+${resortTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>City Tourism Tax (5%):</span>
                  <span className="text-blue-400">+${cityTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-amber-400">
                  <span>VIP Member Concierge Discount (-):</span>
                  <span className="font-semibold">-${vipDiscount.toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-800 pt-2.5 flex justify-between items-center font-extrabold text-base text-amber-400">
                  <span>Grand Total Payable:</span>
                  <span className="text-lg text-emerald-400 font-mono">${totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-all"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <IconCheckCircle size={16} />
                  <span>Confirm Reservation (${totalAmount.toLocaleString()})</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
