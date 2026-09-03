import React, { useState, useEffect } from 'react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useHotel } from '../../context/HotelContext';
import {
  IconCrown,
  IconCalendar,
  IconHeart,
  IconCreditCard,
  IconBell,
  IconUserCheck,
  IconSettings,
  IconSparkles,
  IconKey,
  IconCheckCircle,
  IconX,
  IconPhone,
  IconMail,
  IconMapPin,
  IconLock,
  IconPrinter,
  IconStar,
  IconLogOut,
  IconBed,
  IconPlus
} from '../Icons';
import { ConfirmModal } from '../ConfirmModal';
import { PaymentModal } from '../PaymentModal';

const DEFAULT_AVATAR = 'data:image/svg+xml;utf8,<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><circle cx="64" cy="64" r="64" fill="%23E2E8F0"/><circle cx="64" cy="46" r="22" fill="%23718096"/><path d="M22 108C22 84.804 40.804 66 64 66C87.196 66 106 84.804 106 108V114C106 114 90 124 64 124C38 124 22 114 22 114V108Z" fill="%23718096"/></svg>';

export const CustomerDashboard = ({ onOpenBookingModalWithRoom }) => {
  const {
    isCustomerAuthenticated,
    currentCustomer,
    customerFavorites,
    customerNotifications,
    unreadNotificationsCount,
    markCustomerNotificationsRead,
    clearCustomerNotifications,
    updateCustomerProfile,
    changeCustomerPassword,
    toggleFavoriteRoom,
    customerLogout,
    openCustomerAuthModal,
    setActiveCustomerPage,
    setSelectedRoomForDetails
  } = useCustomerAuth();

  const {
    rooms,
    bookings,
    cancelBooking,
    setSelectedInvoice,
    addToast
  } = useHotel();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'bookings' | 'favorites' | 'payments' | 'notifications' | 'profile' | 'settings'

  // Booking Cancellation State
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [paymentBooking, setPaymentBooking] = useState(null);

  // Profile Edit State
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileCountry, setProfileCountry] = useState('United States');
  const [profileAddress, setProfileAddress] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [foodPreferences, setFoodPreferences] = useState('');
  const [roomPreferences, setRoomPreferences] = useState('');

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Settings State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [currency, setCurrency] = useState('USD ($)');

  // Sync profile fields when currentCustomer changes
  useEffect(() => {
    if (currentCustomer) {
      setProfileName(currentCustomer.name || '');
      setProfilePhone(currentCustomer.phone || '');
      setProfileCountry(currentCustomer.country || 'United States');
      setProfileAddress(currentCustomer.address || '');
      setProfileAvatar(currentCustomer.avatar || PRESET_AVATARS[0]);
      setFoodPreferences(currentCustomer.foodPreferences || '');
      setRoomPreferences(currentCustomer.roomPreferences || '');
    }
  }, [currentCustomer]);

  // Filter Bookings matching Customer Email or Name
  const customerEmail = currentCustomer?.email?.toLowerCase() || '';
  const customerBookings = bookings.filter(
    (b) =>
      (customerEmail && b.guestEmail?.toLowerCase() === customerEmail) ||
      (currentCustomer?.name && b.guestName?.toLowerCase() === currentCustomer.name.toLowerCase())
  );

  // Determine Active Reservation (Checked-In, Reserved, Confirmed)
  const activeBooking = customerBookings.find(
    (b) => b.status === 'Checked-In' || b.status === 'Reserved' || b.status === 'Confirmed'
  );

  // Filter Favorite Rooms
  const savedRooms = rooms.filter((r) => customerFavorites.includes(r.number));

  // Compute real metrics
  const totalSpent = customerBookings
    .filter((b) => b.status !== 'Cancelled')
    .reduce((acc, b) => acc + (b.totalAmount || 0), 0);

  const totalStays = customerBookings.filter((b) => b.status === 'Checked-Out').length;
  const rewardPoints = currentCustomer?.rewardPoints || (totalSpent > 0 ? totalSpent * 2 : 100);
  const membershipTier = currentCustomer?.membership || currentCustomer?.vipStatus || 'Standard';

  // Handle Profile Update
  const handleProfileSave = async (e) => {
    e.preventDefault();
    await updateCustomerProfile({
      name: profileName,
      phone: profilePhone,
      country: profileCountry,
      address: profileAddress,
      avatar: profileAvatar,
      foodPreferences,
      roomPreferences
    });
  };

  // Handle Password Change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      addToast('New password must be at least 6 characters long.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('New passwords do not match.', 'error');
      return;
    }
    const res = await changeCustomerPassword(currentPassword, newPassword, confirmPassword);
    if (res.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  // Confirm Cancellation
  const handleConfirmCancel = () => {
    if (cancellingBookingId) {
      cancelBooking(cancellingBookingId);
      setCancellingBookingId(null);
      addToast(`Booking #${cancellingBookingId} successfully cancelled.`, 'info');
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview & Keycard', icon: <IconSparkles size={16} /> },
    { id: 'bookings', label: 'My Bookings', icon: <IconCalendar size={16} />, badge: customerBookings.length },
    { id: 'favorites', label: 'Saved Sanctuaries', icon: <IconHeart size={16} />, badge: savedRooms.length },
    { id: 'payments', label: 'Billing & Folios', icon: <IconCreditCard size={16} /> },
    { id: 'notifications', label: 'VIP Alerts', icon: <IconBell size={16} />, badge: unreadNotificationsCount },
    { id: 'profile', label: 'Profile & Security', icon: <IconUserCheck size={16} /> },
    { id: 'settings', label: 'Preferences', icon: <IconSettings size={16} /> }
  ];

  // Unauthenticated Prompt
  if (!isCustomerAuthenticated || !currentCustomer) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6 animate-fade-in font-sans">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center shadow-xl">
          <IconCrown size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-100">
            Welcome to the Aurelia Guest Lounge
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Sign in or create your member account to access real-time reservations, digital keycard, and VIP hospitality services.
          </p>
        </div>
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            onClick={() => openCustomerAuthModal('login')}
            className="px-6 py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/25 transition-all transform active:scale-95"
          >
            Sign In / Register
          </button>
          <button
            onClick={() => setActiveCustomerPage('rooms')}
            className="px-6 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl transition-colors"
          >
            Explore Suites
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in font-sans">
      {/* Top Customer VIP Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-amber-600/15 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Avatar & Real MongoDB Info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={currentCustomer.avatar || PRESET_AVATARS[0]}
                alt={currentCustomer.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-amber-400 shadow-xl bg-slate-800"
              />
              <span className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-slate-950 border border-amber-400 text-amber-400">
                <IconCrown size={14} />
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-slate-100">
                  Welcome, {currentCustomer.name}
                </h1>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-sm uppercase tracking-wider">
                  {membershipTier} Member
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono">{currentCustomer.email}</div>
              <div className="text-[11px] text-amber-400 font-semibold flex items-center gap-1.5 pt-0.5">
                <IconSparkles size={13} />
                <span>
                  Member ID: #{currentCustomer._id || currentCustomer.id || 'CUST-NEW'} • 24/7 Butler Active
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full md:w-auto">
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase">TOTAL STAYS</div>
              <div className="text-base font-bold text-slate-100 font-serif">{totalStays}</div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase">LIFETIME SPEND</div>
              <div className="text-base font-bold text-emerald-400 font-mono">
                ${totalSpent.toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase">SAVED SUITES</div>
              <div className="text-base font-bold text-amber-400 font-mono">{savedRooms.length}</div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase">REWARD PTS</div>
              <div className="text-base font-bold text-amber-300 font-mono">
                {rewardPoints.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar Tabs + Active Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-2">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-3 space-y-1 shadow-xl">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === item.id
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 font-extrabold'
                    : 'text-slate-300 hover:text-amber-300 hover:bg-slate-800/60'
                  }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeTab === item.id
                        ? 'bg-slate-950 text-amber-400'
                        : 'bg-slate-800 text-slate-300'
                      }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            ))}

            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={customerLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <IconLogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Concierge Hotline Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 space-y-2 text-xs">
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
              24/7 DEDICATED BUTLER
            </div>
            <div className="font-bold text-slate-100">Need Immediate Assistance?</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Your VIP Concierge is standing by to assist with dining, yacht charters, or suite changes.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setActiveCustomerPage('contact');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-amber-400 text-xs font-bold rounded-xl transition-colors"
              >
                Contact Concierge Desk
              </button>
            </div>
          </div>
        </div>

        {/* Content Area (3 Columns) */}
        <div className="lg:col-span-3 space-y-6">
          {/* =========================================================
              TAB 1: OVERVIEW & DIGITAL KEYCARD (FIXED RESERVATION CHECK)
             ========================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {/* Conditional Active Reservation vs No Active Reservation */}
              {activeBooking ? (
                <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-widest">
                        <IconKey size={16} />
                        <span>AURELIA SMART DIGITAL KEYCARD</span>
                      </div>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-100">
                        Keyless Suite Entry System
                      </h3>
                      <p className="text-xs text-slate-400">
                        Hold your device near the door sensor to unlock your reserved sanctuary.
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold self-start sm:self-auto">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>NFC Door Active</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                        ASSIGNED SUITE
                      </div>
                      <div className="text-lg font-bold text-slate-100 font-serif">
                        {activeBooking.roomCategory || 'Luxury'} Suite {activeBooking.roomNumber}
                      </div>
                      <div className="text-xs text-amber-400">
                        Check-in: {activeBooking.checkIn} • Check-out: {activeBooking.checkOut}
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        addToast(
                          `📶 NFC Digital Key Transmitted! Suite ${activeBooking.roomNumber} Door Unlocked.`,
                          'success'
                        )
                      }
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transform active:scale-95 transition-all"
                    >
                      <IconKey size={16} />
                      <span>Hold to Unlock Suite Door</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Empty State when no active booking exists */
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-xl">
                  <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
                    <IconBed size={32} />
                  </div>
                  <div className="space-y-1.5 max-w-md mx-auto">
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-100">
                      No Active Reservation
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      You currently do not have an active suite or villa booking at Aurelia Resort. Explore our oceanfront suites and penthouses to reserve your stay.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        if (onOpenBookingModalWithRoom) onOpenBookingModalWithRoom();
                        else setActiveCustomerPage('rooms');
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/25 inline-flex items-center gap-2 transform active:scale-95 transition-all"
                    >
                      <IconPlus size={16} />
                      <span>Book Now</span>
                    </button>
                  </div>
                </div>
              )}

              {/* VIP Benefits & Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <div className="text-amber-400 font-bold text-xs uppercase tracking-wider">
                    COMPLIMENTARY PRIVILEGES
                  </div>
                  <div className="font-bold text-sm text-slate-100">Michelin Dining Credit</div>
                  <p className="text-[11px] text-slate-400">
                    Enjoy up to $150 daily gourmet dining credit across all Aurelia restaurants.
                  </p>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <div className="text-amber-400 font-bold text-xs uppercase tracking-wider">
                    EXPERIENCE & RELAXATION
                  </div>
                  <div className="font-bold text-sm text-slate-100">Serenity Thalasso Spa</div>
                  <p className="text-[11px] text-slate-400">
                    Priority access to private thermal baths, hydrotherapy, and custom massages.
                  </p>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <div className="text-amber-400 font-bold text-xs uppercase tracking-wider">
                    TRANSPORT & LEISURE
                  </div>
                  <div className="font-bold text-sm text-slate-100">Helipad & Yacht Access</div>
                  <p className="text-[11px] text-slate-400">
                    Complimentary Rolls-Royce airport transfer and sunset catamaran bookings.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              TAB 2: MY BOOKINGS
             ========================================================= */}
          {activeTab === 'bookings' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-100">My Reservations</h3>
                  <p className="text-xs text-slate-400">View and manage your upcoming and past stays.</p>
                </div>
                <button
                  onClick={() => {
                    if (onOpenBookingModalWithRoom) onOpenBookingModalWithRoom();
                    else setActiveCustomerPage('rooms');
                  }}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <IconPlus size={14} />
                  <span>New Booking</span>
                </button>
              </div>

              {customerBookings.length === 0 ? (
                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center space-y-3">
                  <IconCalendar size={32} className="text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">No booking history found for this account.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {customerBookings.map((b) => (
                    <div
                      key={b.id}
                      className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-100">
                            {b.roomCategory || 'Suite'} #{b.roomNumber}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${b.status === 'Checked-In'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : b.status === 'Reserved'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                          >
                            {b.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">
                          {b.checkIn} → {b.checkOut} ({b.totalNights || 1} nights) • #{b.id}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-bold text-emerald-400 font-mono">
                            ${(b.totalAmount || 0).toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-400">{b.paymentStatus || 'Paid'}</div>
                        </div>

                        {b.status !== 'Cancelled' && (
                          <button
                            onClick={() => setCancellingBookingId(b.id)}
                            className="px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 rounded-xl transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              TAB 3: SAVED FAVORITES
             ========================================================= */}
          {activeTab === 'favorites' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-100">Saved Suites & Sanctuaries</h3>
                <p className="text-xs text-slate-400">Your curated collection of favorite resort accommodations.</p>
              </div>

              {savedRooms.length === 0 ? (
                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center space-y-3">
                  <IconHeart size={32} className="text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">You have not saved any rooms yet.</p>
                  <button
                    onClick={() => setActiveCustomerPage('rooms')}
                    className="px-4 py-2 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
                  >
                    Browse Suites
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedRooms.map((r) => (
                    <div
                      key={r.id}
                      className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl overflow-hidden group transition-all"
                    >
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={r.image}
                          alt={r.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <button
                          onClick={() => toggleFavoriteRoom(r.number)}
                          className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/80 text-rose-500 hover:bg-slate-950"
                        >
                          <IconHeart size={16} />
                        </button>
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="font-bold text-sm text-slate-100">{r.name}</div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-amber-400 font-mono font-bold">${r.price} / night</span>
                          <button
                            onClick={() => {
                              if (onOpenBookingModalWithRoom) onOpenBookingModalWithRoom(r);
                              else setSelectedRoomForDetails(r);
                            }}
                            className="px-3 py-1 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-[11px]"
                          >
                            Book Room
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              TAB 4: USER PROFILE & SECURITY
             ========================================================= */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fade-in">
              {/* Profile Details Form */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-100">Personal Information</h3>
                  <p className="text-xs text-slate-400">Update your member credentials and contact preferences.</p>
                </div>

                <form onSubmit={handleProfileSave} className="space-y-4">
                  {/* Avatar Picker / Custom URL */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-300">Profile Photo</label>
                    <div className="flex items-center gap-4">
                      <img
                        src={profileAvatar || DEFAULT_AVATAR}
                        alt="Avatar Preview"
                        className="w-14 h-14 rounded-full object-cover border-2 border-amber-400 shadow-md flex-shrink-0 bg-slate-800"
                      />
                      <div className="space-y-1 flex-1">
                        <input
                          type="text"
                          value={profileAvatar}
                          onChange={(e) => setProfileAvatar(e.target.value)}
                          placeholder="Custom image URL (optional)..."
                          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                        />
                        <p className="text-[10px] text-slate-500">
                          Leave empty for the default luxury silhouette avatar, or paste a custom image URL.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-300">Full Name</label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-300">Email (Verified)</label>
                      <input
                        type="email"
                        value={currentCustomer.email}
                        disabled
                        className="w-full bg-slate-950/50 border border-slate-800 text-slate-500 rounded-xl px-3.5 py-2 text-xs cursor-not-allowed font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-300">Phone Number</label>
                      <input
                        type="tel"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder="+1 (555) 019-2834"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-300">Country / Region</label>
                      <input
                        type="text"
                        value={profileCountry}
                        onChange={(e) => setProfileCountry(e.target.value)}
                        placeholder="United States"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300">Residential Address</label>
                    <input
                      type="text"
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value)}
                      placeholder="100 Luxury Promenade, Beverly Hills, CA"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    Save Profile Changes
                  </button>
                </form>
              </div>

              {/* Password Change Form */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-100">Security & Password</h3>
                  <p className="text-xs text-slate-400">Change your password to maintain account security.</p>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-3.5 max-w-md">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    Update Password
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* =========================================================
              TAB 5: NOTIFICATIONS & ALERTS
             ========================================================= */}
          {activeTab === 'notifications' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-100">VIP Alerts & Notifications</h3>
                  <p className="text-xs text-slate-400">Concierge messages, booking confirmations, and special offers.</p>
                </div>
                {customerNotifications.length > 0 && (
                  <button
                    onClick={markCustomerNotificationsRead}
                    className="text-xs text-amber-400 hover:text-amber-300 font-bold"
                  >
                    Mark All as Read
                  </button>
                )}
              </div>

              {customerNotifications.length === 0 ? (
                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center text-slate-400 text-xs">
                  No notifications at this time.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {customerNotifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-4 rounded-2xl border transition-all ${n.read
                          ? 'bg-slate-900/50 border-slate-800/80 text-slate-400'
                          : 'bg-slate-900/90 border-amber-500/30 text-slate-200'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-xs text-slate-100">{n.title}</div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              TAB 6: BILLING & FOLIOS
             ========================================================= */}
          {activeTab === 'payments' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-100">Billing & Invoices</h3>
                <p className="text-xs text-slate-400">Review your payment history and download digital folios.</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs text-slate-400 font-bold">
                  <span>RESERVATION</span>
                  <span>DATE</span>
                  <span>STATUS</span>
                  <span>TOTAL</span>
                </div>
                {customerBookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between text-xs py-2 text-slate-300">
                    <span className="font-bold text-slate-100 font-serif">#{b.id}</span>
                    <span>{b.createdAt || b.checkIn}</span>
                    <span className="text-emerald-400 font-bold">{b.paymentStatus || 'Paid'}</span>
                    <span className="font-mono font-bold text-amber-400">
                      ${(b.totalAmount || 0).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================
              TAB 7: PREFERENCES & SETTINGS
             ========================================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h3 className="font-serif text-lg font-bold text-slate-100">Hospitality Preferences</h3>
                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex items-center justify-between py-2 border-b border-slate-800">
                    <div>
                      <div className="font-bold">Email Notifications</div>
                      <div className="text-[11px] text-slate-500">Receive stay reminders and concierge messages</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-slate-800">
                    <div>
                      <div className="font-bold">SMS Keyless Entry Alerts</div>
                      <div className="text-[11px] text-slate-500">Instant SMS pin when suite is ready</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={smsAlerts}
                      onChange={(e) => setSmsAlerts(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Cancellation Confirmation Modal */}
      {cancellingBookingId && (
        <ConfirmModal
          isOpen={!!cancellingBookingId}
          title="Cancel Reservation"
          message={`Are you sure you want to cancel booking #${cancellingBookingId}? Complimentary cancellation policy applies.`}
          confirmText="Yes, Cancel Booking"
          cancelText="Keep Booking"
          onConfirm={handleConfirmCancel}
          onCancel={() => setCancellingBookingId(null)}
        />
      )}
    </div>
  );
};
