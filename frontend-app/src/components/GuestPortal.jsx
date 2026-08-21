import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { useTranslation } from '../i18n/I18nContext';
import { getRoomUpgradeRecommendations } from '../services/recommendationEngine';
import { IconCrown, IconStar, IconCalendar, IconUsers, IconLogOut, IconDollarSign, IconGlobe, IconMenu, IconX, IconSparkles } from './Icons';
import { DiningMenu } from './DiningMenu';
import { UserLogin } from './UserLogin';
import { PaymentModal } from './PaymentModal';
import { RecommendationWidget } from './RecommendationWidget';
import { AIChatbot } from './AIChatbot';

export const GuestPortal = ({ onOpenBookingModalWithRoom }) => {
  const {
    rooms,
    bookings,
    setPortalMode,
    setSelectedInvoice,
    isGuestAuthenticated,
    currentGuest,
    logoutGuest,
    openAuthModal,
    openGoogleModal,
    addToast
  } = useHotel();
  const { language, setLanguage, t } = useTranslation();
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' | 'dining' | 'my-bookings' | 'login'
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [paymentBooking, setPaymentBooking] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const availableRooms = rooms.filter((r) => r.status === 'Available' || r.status === 'Cleaning');
  const filteredRooms = availableRooms.filter(
    (r) => categoryFilter === 'All' || r.category === categoryFilter
  );

  // Generate Smart Upgrade Recommendation for featured room
  const featuredRoom = availableRooms.find((r) => r.category === 'Standard' || r.category === 'Executive') || availableRooms[0];
  const roomUpgradeData = getRoomUpgradeRecommendations(featuredRoom, rooms);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Luxury Guest Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 lg:px-12 py-3.5 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20 flex-shrink-0">
            <IconCrown size={22} />
          </div>
          <div>
            <div className="font-serif text-base sm:text-xl font-bold tracking-wide text-slate-100">
              {t('resortTitle') || 'AURELIA RESORT'}
            </div>
            <div className="text-[10px] text-amber-400 font-semibold tracking-widest uppercase hidden sm:block">
              Luxury Beach Resort & Spa
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links (>= 900px) */}
        <div className="hidden md:flex items-center gap-2 bg-slate-950/80 p-1 rounded-2xl border border-slate-800">
          <button
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'explore'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => setActiveTab('explore')}
          >
            {t('suitesVillas') || 'Suites & Villas'}
          </button>
          <button
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'dining'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => setActiveTab('dining')}
          >
            {t('inRoomDining') || 'In-Room Dining'}
          </button>
          <button
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'my-bookings'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => setActiveTab('my-bookings')}
          >
            {t('myBookings') || 'My Bookings'}
          </button>
        </div>

        {/* Right Controls Container */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs">
            <IconGlobe size={14} className="text-amber-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent border-none text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer pr-1"
            >
              <option value="en" className="bg-slate-900 text-white">🇬🇧 EN</option>
              <option value="hi" className="bg-slate-900 text-white">🇮🇳 हिंदी</option>
            </select>
          </div>

          {/* Switch to Staff Console */}
          <button
            onClick={() => setPortalMode('admin')}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition-colors"
            title="Switch to Staff Operations Console"
          >
            <span>Staff Portal</span>
          </button>

          {/* Guest Profile or Sign In Button */}
          {isGuestAuthenticated && currentGuest ? (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center">
                {currentGuest.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-xs font-bold text-slate-100 max-w-[120px] truncate">
                {currentGuest.name}
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300">
                {currentGuest.vipStatus || 'VIP'}
              </span>
              <button
                onClick={logoutGuest}
                title="Sign Out Guest"
                className="text-slate-400 hover:text-rose-400 transition-colors p-1"
              >
                <IconLogOut size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => openAuthModal({ initialRole: 'guest', initialMode: 'login' })}
                className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 text-xs font-extrabold px-3.5 sm:px-4 py-2 rounded-xl shadow-lg shadow-amber-500/25 transition-all transform active:scale-95 whitespace-nowrap flex items-center gap-1.5"
              >
                <IconCrown size={15} />
                <span>{t('guestSignIn') || 'Guest Portal Sign In'}</span>
              </button>
            </div>
          )}

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 hover:text-amber-300 transition-colors"
            aria-label="Toggle Mobile Menu"
          >
            {isMobileMenuOpen ? <IconX size={20} /> : <IconMenu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu (< 768px) */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-2.5 animate-fade-in">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                setActiveTab('explore');
                setIsMobileMenuOpen(false);
              }}
              className={`p-2.5 text-xs font-bold rounded-xl text-center transition-all ${
                activeTab === 'explore'
                  ? 'bg-amber-400 text-slate-950 font-extrabold'
                  : 'bg-slate-950 text-slate-300 border border-slate-800'
              }`}
            >
              Suites
            </button>
            <button
              onClick={() => {
                setActiveTab('dining');
                setIsMobileMenuOpen(false);
              }}
              className={`p-2.5 text-xs font-bold rounded-xl text-center transition-all ${
                activeTab === 'dining'
                  ? 'bg-amber-400 text-slate-950 font-extrabold'
                  : 'bg-slate-950 text-slate-300 border border-slate-800'
              }`}
            >
              Dining
            </button>
            <button
              onClick={() => {
                setActiveTab('my-bookings');
                setIsMobileMenuOpen(false);
              }}
              className={`p-2.5 text-xs font-bold rounded-xl text-center transition-all ${
                activeTab === 'my-bookings'
                  ? 'bg-amber-400 text-slate-950 font-extrabold'
                  : 'bg-slate-950 text-slate-300 border border-slate-800'
              }`}
            >
              Bookings
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800 flex gap-2">
            <button
              onClick={() => {
                openGoogleModal({ role: 'guest' });
                setIsMobileMenuOpen(false);
              }}
              className="flex-1 py-2.5 bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-2.9z" />
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.4-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z" />
              </svg>
              <span>Google Sign In</span>
            </button>

            <button
              onClick={() => {
                setPortalMode('admin');
                setIsMobileMenuOpen(false);
              }}
              className="flex-1 py-2.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold rounded-xl flex items-center justify-center"
            >
              Staff Console
            </button>
          </div>
        </div>
      )}

      {/* Hero Banner Section */}
      <div
        className="relative min-h-[360px] sm:min-h-[420px] flex flex-col items-center justify-center text-center px-4 sm:px-6 py-10"
        style={{
          backgroundImage:
            'linear-gradient(to bottom, rgba(7, 10, 16, 0.4), rgba(7, 10, 16, 0.95)), url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="flex gap-1 text-amber-400 mb-3">
          {[...Array(5)].map((_, i) => (
            <IconStar key={i} size={18} />
          ))}
        </div>
        <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold mb-2 tracking-wide text-slate-100">
          {t('experienceLuxury') || 'Unparalleled Coastal Splendor'}
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-xl mb-6">
          {t('heroSubtitle') || 'Immerse yourself in barefoot luxury, bespoke butler services, and private oceanfront sanctuaries.'}
        </p>

        {/* Date / Search Bar Widget (Fully responsive stacked / inline) */}
        <div className="w-full max-w-2xl bg-slate-900/90 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3 flex-1">
            <IconCalendar size={20} className="text-amber-400 flex-shrink-0" />
            <div className="text-left">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">CHECK IN - CHECK OUT</div>
              <div className="text-xs sm:text-sm font-bold text-slate-100">Aug 21 - Aug 26 (5 Nights)</div>
            </div>
          </div>

          <div className="hidden sm:block h-8 w-[1px] bg-slate-800" />

          <div className="flex items-center gap-3 flex-1">
            <IconUsers size={20} className="text-amber-400 flex-shrink-0" />
            <div className="text-left">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">GUESTS & SUITES</div>
              <div className="text-xs sm:text-sm font-bold text-slate-100">2 Adults • 1 Luxury Suite</div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('explore')}
            className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-extrabold px-5 py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all transform active:scale-95 whitespace-nowrap min-h-[44px]"
          >
            {t('searchAvailability') || 'Search Suites'}
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {activeTab === 'explore' ? (
          <>
            {/* Smart AI Upgrade Recommendation Banner */}
            {roomUpgradeData && (
              <div className="mb-8">
                <RecommendationWidget
                  type="room"
                  data={roomUpgradeData}
                  onAction={(upgradedRoom) => onOpenBookingModalWithRoom(upgradedRoom)}
                />
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-100">
                  {t('selectSanctuary') || 'Curated Suites & Private Villas'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Showing {filteredRooms.length} available sanctuaries with private ocean views
                </p>
              </div>

              {/* Category Filter Chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar">
                {['All', 'Suite', 'Penthouse', 'Executive', 'Villa', 'Standard'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      categoryFilter === cat
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Room Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filteredRooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-3xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/10 group"
                >
                  <div className="relative h-48 sm:h-52 overflow-hidden">
                    <img
                      src={room.image}
                      alt={room.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-amber-400 font-extrabold text-xs sm:text-sm border border-amber-500/30">
                      ${room.price} <span className="text-[10px] text-slate-400 font-normal">/ night</span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                        {room.category} • Floor {room.floor}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-100 mt-1">{room.name}</h3>

                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {room.amenities.slice(0, 4).map((am, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300"
                          >
                            ✓ {am}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenBookingModalWithRoom(room)}
                      className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-extrabold py-2.5 rounded-xl shadow-md shadow-amber-500/20 transition-all transform active:scale-95 min-h-[44px]"
                    >
                      {t('bookStay') || 'Reserve Sanctuary'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : activeTab === 'dining' ? (
          <DiningMenu />
        ) : activeTab === 'login' ? (
          <UserLogin />
        ) : (
          <div className="space-y-8 animate-fade-in">
            {/* VIP Digital Keycard & Butler Concierge Banner */}
            <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-amber-600/15 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-widest">
                    <IconSparkles size={16} />
                    <span>Aurelia Elite VIP Concierge & Digital Access</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-100">
                    Welcome to Your Sanctuary, {currentGuest?.name || 'Muhammed Ibrahim'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300">
                    Enjoy seamless keyless suite entry, 24/7 dedicated butler assistance, and Michelin-star in-room dining privileges.
                  </p>
                </div>

                {/* Virtual Mobile Keycard */}
                <div className="bg-slate-950/90 border border-amber-500/50 rounded-2xl p-4 sm:p-5 w-full sm:w-80 shadow-2xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-amber-400 font-bold">DIGITAL KEYCARD</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  </div>
                  <div className="font-serif text-lg font-bold text-slate-100">
                    Penthouse Suite 401
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                    <span>Access Status:</span>
                    <span className="text-emerald-400 font-bold">NFC Door Active</span>
                  </div>
                  <button
                    onClick={() => {
                      if (addToast) addToast('Suite 401 Door Unlocked via NFC Digital Key! Welcome inside.', 'success');
                    }}
                    className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-extrabold py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>📶 Tap to Unlock Suite Door</span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-serif text-xl font-bold text-slate-100 mb-4">
                Your Active Reservations & Digital Folios
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {bookings.map((b) => (
                  <div key={b.id} className="bg-slate-900 border border-amber-500/40 rounded-3xl p-5 space-y-4 shadow-xl hover-card-lift">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">
                        CONFIRMED VOUCHER
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        {b.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-slate-100">{b.guestName}</h4>
                      <div className="text-xs text-slate-400 font-mono">Folio Ref: {b.id}</div>
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-2xl space-y-2 border border-slate-800 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Suite:</span>
                        <span className="font-bold text-amber-400">Room {b.roomNumber} ({b.roomCategory})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Dates:</span>
                        <span className="font-semibold text-slate-200">{b.checkIn} → {b.checkOut}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Payment:</span>
                        <span className={b.paymentStatus === 'Paid' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                          {b.paymentStatus || 'Pending'}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-800">
                        <span className="text-slate-400">Total:</span>
                        <span className="font-extrabold text-emerald-400">${b.totalAmount?.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedInvoice(b)}
                        className="flex-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold py-2.5 rounded-xl transition-colors min-h-[44px]"
                      >
                        View Folio
                      </button>
                      {b.paymentStatus !== 'Paid' ? (
                        <button
                          onClick={() => setPaymentBooking(b)}
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold py-2.5 rounded-xl shadow-md transition-all min-h-[44px]"
                        >
                          Pay Now
                        </button>
                      ) : (
                        <button
                          disabled
                          className="flex-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold py-2.5 rounded-xl min-h-[44px]"
                        >
                          ✓ Paid
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {paymentBooking && (
        <PaymentModal
          isOpen={Boolean(paymentBooking)}
          onClose={() => setPaymentBooking(null)}
          bookingData={paymentBooking}
          onPaymentSuccess={() => setPaymentBooking(null)}
        />
      )}

      {/* AI Concierge Assistant Drawer */}
      <AIChatbot />
    </div>
  );
};
