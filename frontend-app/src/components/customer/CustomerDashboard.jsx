import React, { useState } from 'react';
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
  IconLogOut
} from '../Icons';
import { ConfirmModal } from '../ConfirmModal';
import { PaymentModal } from '../PaymentModal';

export const CustomerDashboard = ({ onOpenBookingModalWithRoom }) => {
  const {
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
  const [profileName, setProfileName] = useState(currentCustomer?.name || '');
  const [profilePhone, setProfilePhone] = useState(currentCustomer?.phone || '');
  const [profileAddress, setProfileAddress] = useState(currentCustomer?.address || '');
  const [profileAvatar, setProfileAvatar] = useState(currentCustomer?.avatar || '');
  const [foodPreferences, setFoodPreferences] = useState(currentCustomer?.foodPreferences || '');
  const [roomPreferences, setRoomPreferences] = useState(currentCustomer?.roomPreferences || '');

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Settings State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [currency, setCurrency] = useState('USD ($)');

  // Filter Bookings matching Customer Email
  const customerEmail = currentCustomer?.email?.toLowerCase() || '';
  const customerBookings = bookings.filter(
    (b) =>
      b.guestEmail?.toLowerCase() === customerEmail ||
      b.guestName?.toLowerCase() === currentCustomer?.name?.toLowerCase()
  );

  // Filter Favorite Rooms
  const savedRooms = rooms.filter((r) => customerFavorites.includes(r.number));

  // Compute metrics
  const totalSpent = customerBookings
    .filter((b) => b.status !== 'Cancelled')
    .reduce((acc, b) => acc + (b.totalAmount || 0), 0) || (currentCustomer?.vipStatus === 'Diamond' ? 58000 : 12800);

  const totalStays = customerBookings.filter((b) => b.status === 'Checked-Out').length || (currentCustomer?.vipStatus === 'Diamond' ? 15 : 6);
  const rewardPoints = totalSpent * 2;

  // Handle Profile Update
  const handleProfileSave = async (e) => {
    e.preventDefault();
    await updateCustomerProfile({
      name: profileName,
      phone: profilePhone,
      address: profileAddress,
      avatar: profileAvatar,
      foodPreferences,
      roomPreferences
    });
  };

  // Handle Password Change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in font-sans">
      {/* Top Customer VIP Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-amber-600/15 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Avatar & Info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={currentCustomer?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                alt={currentCustomer?.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-xl"
              />
              <span className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-slate-950 border border-amber-400 text-amber-400">
                <IconCrown size={14} />
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-slate-100">
                  Welcome, {currentCustomer?.name || 'Valued Patron'}
                </h1>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-sm uppercase tracking-wider">
                  {currentCustomer?.vipStatus || 'Diamond'} VIP
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono">{currentCustomer?.email}</div>
              <div className="text-[11px] text-amber-400 font-semibold flex items-center gap-1.5 pt-0.5">
                <IconSparkles size={13} />
                <span>Member ID: #{currentCustomer?.id || 'CUST-100'} • 24/7 Butler Active</span>
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
              <div className="text-base font-bold text-emerald-400 font-mono">${totalSpent.toLocaleString()}</div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase">SAVED SUITES</div>
              <div className="text-base font-bold text-amber-400 font-mono">{savedRooms.length}</div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase">REWARD PTS</div>
              <div className="text-base font-bold text-amber-300 font-mono">{rewardPoints.toLocaleString()}</div>
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
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === item.id
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
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      activeTab === item.id
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
          {/* TAB 1: OVERVIEW & DIGITAL KEYCARD */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {/* NFC Digital Mobile Keycard */}
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
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">ASSIGNED SUITE</div>
                    <div className="text-lg font-bold text-slate-100 font-serif">Presidential Sovereign Suite 401</div>
                    <div className="text-xs text-amber-400">Floor 4 • Private Oceanfront Balcony</div>
                  </div>

                  <button
                    onClick={() =>
                      addToast('📶 NFC Digital Key Transmitted! Suite 401 Door Unlocked.', 'success')
                    }
                    className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-extrabold px-6 py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all transform active:scale-95 whitespace-nowrap flex items-center justify-center gap-2"
                  >
                    <span>📶 Tap to Unlock Suite Door</span>
                  </button>
                </div>
              </div>

              {/* Active Bookings Preview */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-bold text-slate-100">
                    Your Upcoming & Active Sanctuaries
                  </h3>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="text-xs text-amber-400 hover:underline font-bold"
                  >
                    View All ({customerBookings.length})
                  </button>
                </div>

                {customerBookings.length === 0 ? (
                  <div className="text-center py-8 space-y-3">
                    <p className="text-xs text-slate-400">You do not have any active reservations currently.</p>
                    <button
                      onClick={() => {
                        setActiveCustomerPage('rooms');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-4 py-2 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
                    >
                      Book a Luxury Sanctuary
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customerBookings.slice(0, 2).map((b) => (
                      <div
                        key={b.id}
                        className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-100 text-sm">Room {b.roomNumber} ({b.roomCategory || 'Suite'})</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300">
                              {b.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400">
                            {b.checkIn} → {b.checkOut} ({b.totalNights || 3} Nights) • Folio: #{b.id}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => setSelectedInvoice(b)}
                            className="flex-1 sm:flex-initial px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl"
                          >
                            View Folio
                          </button>
                          {b.status !== 'Cancelled' && (
                            <button
                              onClick={() => setCancellingBookingId(b.id)}
                              className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold rounded-xl"
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
            </div>
          )}

          {/* TAB 2: MY BOOKINGS & HISTORY */}
          {activeTab === 'bookings' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-100">
                    Your Reservations & Digital Folios
                  </h2>
                  <p className="text-xs text-slate-400">
                    Review your active bookings, past stays, and download official tax receipts.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setActiveCustomerPage('rooms');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl self-start sm:self-auto shadow-md"
                >
                  + New Reservation
                </button>
              </div>

              {customerBookings.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                    <IconCalendar size={24} />
                  </div>
                  <h3 className="font-bold text-slate-100 text-base">No Booking History Found</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    You have not reserved any accommodations yet. Explore our suites to start your luxury getaway.
                  </p>
                  <button
                    onClick={() => {
                      setActiveCustomerPage('rooms');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md"
                  >
                    Explore Sanctuaries
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {customerBookings.map((b) => (
                    <div
                      key={b.id}
                      className="bg-slate-900 border border-amber-500/30 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">
                            FOLIO #{b.id}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              b.status === 'Cancelled'
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                : b.status === 'Checked-In'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                            }`}
                          >
                            {b.status}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-base font-bold text-slate-100">
                            Room {b.roomNumber} ({b.roomCategory || 'Luxury Suite'})
                          </h4>
                          <div className="text-xs text-slate-400">Guest: {b.guestName}</div>
                        </div>

                        <div className="bg-slate-950 p-3.5 rounded-2xl space-y-2 border border-slate-800 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Dates:</span>
                            <span className="font-semibold text-slate-200">
                              {b.checkIn} → {b.checkOut}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Payment Status:</span>
                            <span
                              className={
                                b.paymentStatus === 'Paid'
                                  ? 'text-emerald-400 font-bold'
                                  : 'text-amber-400 font-bold'
                              }
                            >
                              {b.paymentStatus || 'Paid'}
                            </span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-slate-800">
                            <span className="text-slate-400">Total Billed:</span>
                            <span className="font-extrabold text-amber-400 font-mono">
                              ${b.totalAmount?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => setSelectedInvoice(b)}
                          className="flex-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold py-2.5 rounded-xl transition-colors"
                        >
                          View Folio
                        </button>

                        {b.paymentStatus !== 'Paid' && b.status !== 'Cancelled' ? (
                          <button
                            onClick={() => setPaymentBooking(b)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl shadow-md transition-all"
                          >
                            Pay Balance
                          </button>
                        ) : null}

                        {b.status !== 'Cancelled' && (
                          <button
                            onClick={() => setCancellingBookingId(b.id)}
                            className="px-3.5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold rounded-xl transition-colors"
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

          {/* TAB 3: SAVED FAVORITES */}
          {activeTab === 'favorites' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-100">
                  Saved Luxury Sanctuaries
                </h2>
                <p className="text-xs text-slate-400">
                  Sanctuaries you have bookmarked for future escapes.
                </p>
              </div>

              {savedRooms.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
                    <IconHeart size={24} />
                  </div>
                  <h3 className="font-bold text-slate-100 text-base">No Saved Sanctuaries</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Click the heart icon on any suite or villa to save it to your wishlist.
                  </p>
                  <button
                    onClick={() => {
                      setActiveCustomerPage('rooms');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-4 py-2 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
                  >
                    Browse Suites
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {savedRooms.map((room) => (
                    <div
                      key={room.id}
                      className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between"
                    >
                      <div className="relative h-48">
                        <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                        <div className="absolute bottom-3 right-3 bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-xl text-amber-400 font-extrabold text-xs border border-amber-500/30">
                          ${room.price} / night
                        </div>
                        <button
                          onClick={() => toggleFavoriteRoom(room.number)}
                          className="absolute top-3 right-3 p-2 rounded-xl bg-slate-950/80 text-rose-500 border border-slate-800"
                        >
                          <IconHeart size={16} filled />
                        </button>
                      </div>

                      <div className="p-5 space-y-3">
                        <div>
                          <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                            {room.category} • Floor {room.floor}
                          </div>
                          <h4 className="text-base font-bold text-slate-100">{room.name}</h4>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                          <button
                            onClick={() => setSelectedRoomForDetails(room)}
                            className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold py-2.5 rounded-xl"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => onOpenBookingModalWithRoom(room)}
                            className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 text-slate-950 text-xs font-extrabold py-2.5 rounded-xl shadow-md"
                          >
                            Book Stay
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PAYMENT HISTORY & BILLING */}
          {activeTab === 'payments' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-100">
                  Payment History & Official Folios
                </h2>
                <p className="text-xs text-slate-400">
                  Detailed VAT tax breakdowns and PDF invoice downloads.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Invoice / Folio</th>
                        <th className="py-3 px-4">Sanctuary</th>
                        <th className="py-3 px-4">Dates</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 font-medium">
                      {customerBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                            INV-{b.id}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-100">
                            Room {b.roomNumber} ({b.roomCategory || 'Suite'})
                          </td>
                          <td className="py-3.5 px-4 text-slate-400">
                            {b.checkIn} → {b.checkOut}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-400">
                            ${b.totalAmount?.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                b.paymentStatus === 'Paid'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {b.paymentStatus || 'Paid'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedInvoice(b)}
                              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold rounded-lg transition-colors"
                            >
                              View PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-100">
                    VIP Concierge Notifications
                  </h2>
                  <p className="text-xs text-slate-400">
                    Updates regarding room service, reservation changes, and VIP privileges.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={markCustomerNotificationsRead}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 text-xs font-bold rounded-xl"
                  >
                    Mark All Read
                  </button>
                  <button
                    onClick={clearCustomerNotifications}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold rounded-xl"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {customerNotifications.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-2">
                  <p className="text-xs text-slate-400">No new notifications at this time.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {customerNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                        notif.read
                          ? 'bg-slate-950/60 border-slate-800/80 text-slate-400'
                          : 'bg-slate-900 border-amber-500/40 text-slate-200 shadow-md'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-slate-100">{notif.title}</h4>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                          )}
                        </div>
                        <p className="text-xs leading-relaxed">{notif.message}</p>
                        <div className="text-[10px] text-slate-500 pt-1 font-mono">
                          {new Date(notif.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: PROFILE & SECURITY */}
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-fade-in">
              {/* Profile Details Form */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="font-serif text-lg font-bold text-slate-100">
                    Personal Profile & Dietary Preferences
                  </h3>
                  <p className="text-xs text-slate-400">
                    Ensure our butler and culinary staff tailor your stay to your exact wishes.
                  </p>
                </div>

                <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Full Legal Name</label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Primary Residence Address</label>
                      <input
                        type="text"
                        value={profileAddress}
                        onChange={(e) => setProfileAddress(e.target.value)}
                        placeholder="e.g. 100 Oceanfront Promenade, Beverly Hills, CA"
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Profile Avatar Photo URL</label>
                      <input
                        type="url"
                        value={profileAvatar}
                        onChange={(e) => setProfileAvatar(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Dietary & Food Preferences</label>
                      <textarea
                        rows={2}
                        value={foodPreferences}
                        onChange={(e) => setFoodPreferences(e.target.value)}
                        placeholder="e.g. Dom Pérignon on arrival, Wagyu steak, Gluten-free menu"
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 p-3 rounded-xl focus:outline-none focus:border-amber-500/60"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Sanctuary & Room Preferences</label>
                      <textarea
                        rows={2}
                        value={roomPreferences}
                        onChange={(e) => setRoomPreferences(e.target.value)}
                        placeholder="e.g. High floor penthouse, Feather pillows, Late 3 PM check-out"
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 p-3 rounded-xl focus:outline-none focus:border-amber-500/60"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    Save Profile Changes
                  </button>
                </form>
              </div>

              {/* Password Change Form */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="font-serif text-lg font-bold text-slate-100">
                    Account Security & Password
                  </h3>
                  <p className="text-xs text-slate-400">
                    Update your account password regularly to protect your reservations and folios.
                  </p>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-4 text-xs max-w-md">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Current Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl font-mono focus:outline-none focus:border-amber-500/60"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">New Password (Min 6 chars)</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl font-mono focus:outline-none focus:border-amber-500/60"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl font-mono focus:outline-none focus:border-amber-500/60"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-xl border border-amber-500/30 transition-colors"
                  >
                    Update Security Password
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 7: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl animate-fade-in text-xs">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="font-serif text-lg font-bold text-slate-100">
                  Guest Experience Settings & Preferences
                </h3>
                <p className="text-xs text-slate-400">
                  Configure language, currency, and real-time stay alerts.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <div>
                    <div className="font-bold text-slate-100">Email Confirmation & Folios</div>
                    <div className="text-slate-400 text-[11px]">Receive itemized receipts directly to your Gmail inbox.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="accent-amber-400 w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <div>
                    <div className="font-bold text-slate-100">SMS Butler Arrival Alerts</div>
                    <div className="text-slate-400 text-[11px]">Receive real-time room readiness and helicopter dispatch alerts.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className="accent-amber-400 w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <div>
                    <div className="font-bold text-slate-100">Preferred Billing Currency</div>
                    <div className="text-slate-400 text-[11px]">Display room rates in your home currency.</div>
                  </div>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-amber-400 font-bold px-3 py-1.5 rounded-xl text-xs"
                  >
                    <option value="USD ($)">USD ($)</option>
                    <option value="EUR (€)">EUR (€)</option>
                    <option value="GBP (£)">GBP (£)</option>
                    <option value="INR (₹)">INR (₹)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Cancellation Confirmation Modal */}
      {cancellingBookingId && (
        <ConfirmModal
          isOpen={Boolean(cancellingBookingId)}
          title="Cancel Sanctuary Reservation?"
          message={`Are you sure you wish to cancel reservation #${cancellingBookingId}? Your room status will be released and cancellation confirmation dispatched.`}
          confirmText="Yes, Cancel Booking"
          cancelText="Keep Reservation"
          onConfirm={handleConfirmCancel}
          onCancel={() => setCancellingBookingId(null)}
          isDanger
        />
      )}

      {/* Payment Modal */}
      {paymentBooking && (
        <PaymentModal
          isOpen={Boolean(paymentBooking)}
          onClose={() => setPaymentBooking(null)}
          bookingData={paymentBooking}
          onPaymentSuccess={() => setPaymentBooking(null)}
        />
      )}
    </div>
  );
};
