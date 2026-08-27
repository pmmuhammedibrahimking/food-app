import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useTranslation } from '../../i18n/I18nContext';
import { getRoomUpgradeRecommendations } from '../../services/recommendationEngine';
import { RecommendationWidget } from '../RecommendationWidget';
import {
  IconCrown,
  IconStar,
  IconCalendar,
  IconUsers,
  IconSparkles,
  IconHeart,
  IconCompass,
  IconUtensils,
  IconShield,
  IconAward,
  IconCheckCircle
} from '../Icons';

export const CustomerHome = ({ onOpenBookingModalWithRoom }) => {
  const { rooms } = useHotel();
  const {
    customerFavorites,
    toggleFavoriteRoom,
    setActiveCustomerPage,
    setSelectedRoomForDetails
  } = useCustomerAuth();
  const { t } = useTranslation();

  // Search Bar State
  const [checkInDate, setCheckInDate] = useState('2026-08-22');
  const [checkOutDate, setCheckOutDate] = useState('2026-08-27');
  const [guestsCount, setGuestsCount] = useState('2 Adults');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const availableRooms = rooms.filter((r) => r.status === 'Available' || r.status === 'Cleaning');
  const featuredRooms = availableRooms.slice(0, 6);

  // Upgrade recommendation
  const standardRoom = availableRooms.find((r) => r.category === 'Standard' || r.category === 'Executive') || availableRooms[0];
  const roomUpgradeData = getRoomUpgradeRecommendations(standardRoom, rooms);

  const amenitiesList = [
    {
      icon: <IconCrown size={24} className="text-amber-400" />,
      title: '24/7 Royal Butler Service',
      description: 'Dedicated butler concierge for unpacking, champagne service, and private yacht reservations.'
    },
    {
      icon: <IconCompass size={24} className="text-amber-400" />,
      title: 'Private Helipad & Chauffeur',
      description: 'Complimentary Rolls-Royce airport transfers and private rooftop helipad arrival protocols.'
    },
    {
      icon: <IconUtensils size={24} className="text-amber-400" />,
      title: 'Michelin-Star Gastronomy',
      description: 'Artisanal in-room tasting menus crafted by master French and Japanese culinary chefs.'
    },
    {
      icon: <IconSparkles size={24} className="text-amber-400" />,
      title: 'Cliffside Infinity Pool & Spa',
      description: 'Private mineral thermal baths, oceanfront cabanas, and restorative organic wellness treatments.'
    }
  ];

  const testimonials = [
    {
      quote: 'Aurelia Resort is the epitome of coastal perfection. The Presidential Penthouse suite and private butler service exceeded every world-class luxury standard.',
      author: 'Lord Alexander Wright',
      location: 'London, United Kingdom',
      rating: 5,
      stay: 'Presidential Sovereign Suite'
    },
    {
      quote: 'From the fresh Dom Pérignon on arrival to the Michelin-star in-room dining, our 10th anniversary was sheer perfection. An unforgettable experience.',
      author: 'Sophia Loren',
      location: 'Rome, Italy',
      rating: 5,
      stay: 'Deluxe Ocean View Suite'
    },
    {
      quote: 'Flawless keyless suite access, ultra-fast Wi-Fi for my executive meetings, and serene private beach sanctuaries. The premier hotel in North America.',
      author: 'Marcus Vance',
      location: 'San Francisco, CA',
      rating: 5,
      stay: 'Royal Penthouse Suite'
    }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveCustomerPage('rooms');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-16 animate-fade-in font-sans pb-12">
      {/* Hero Section */}
      <section
        className="relative min-h-[520px] sm:min-h-[600px] flex flex-col items-center justify-center text-center px-4 sm:px-6 py-16"
        style={{
          backgroundImage:
            'linear-gradient(to bottom, rgba(2, 6, 23, 0.45), rgba(2, 6, 23, 0.95)), url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Glow orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-amber-500/40 text-amber-300 text-xs font-bold shadow-lg backdrop-blur-md">
            <IconSparkles size={14} className="text-amber-400" />
            <span>5-STAR LUXURY RESORT & COASTAL SANCTUARY</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-100 leading-tight">
            Where Coastal Splendor <br />
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              Meets Bespoke Elegance
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Immerse yourself in barefoot luxury, private infinity pools, master-crafted culinary dining, and 24/7 dedicated butler service.
          </p>

          {/* Interactive Search Bar Widget */}
          <form
            onSubmit={handleSearch}
            className="w-full max-w-3xl mx-auto mt-8 bg-slate-900/90 backdrop-blur-2xl border border-amber-500/30 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col md:flex-row items-stretch md:items-center gap-3 sm:gap-4 text-left"
          >
            {/* Check-In / Check-Out */}
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <IconCalendar size={14} className="text-amber-400" />
                <span>CHECK IN & OUT</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-100 px-2.5 py-1.5 rounded-xl font-semibold text-xs focus:outline-none focus:border-amber-500/50 w-full"
                />
                <span className="text-slate-500">→</span>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-100 px-2.5 py-1.5 rounded-xl font-semibold text-xs focus:outline-none focus:border-amber-500/50 w-full"
                />
              </div>
            </div>

            <div className="hidden md:block h-10 w-[1px] bg-slate-800" />

            {/* Guests */}
            <div className="w-full md:w-36 space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <IconUsers size={14} className="text-amber-400" />
                <span>GUESTS</span>
              </div>
              <select
                value={guestsCount}
                onChange={(e) => setGuestsCount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-2.5 py-1.5 rounded-xl font-semibold text-xs focus:outline-none focus:border-amber-500/50"
              >
                <option value="1 Adult">1 Adult</option>
                <option value="2 Adults">2 Adults</option>
                <option value="3 Guests">3 Guests</option>
                <option value="4+ Family">4+ Family</option>
              </select>
            </div>

            <div className="hidden md:block h-10 w-[1px] bg-slate-800" />

            {/* Submit Search */}
            <button
              type="submit"
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-extrabold px-6 py-3.5 rounded-2xl shadow-lg shadow-amber-500/25 transition-all transform active:scale-95 whitespace-nowrap self-stretch md:self-auto min-h-[44px]"
            >
              Search Sanctuaries
            </button>
          </form>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Smart AI Upgrade Banner */}
        {roomUpgradeData && (
          <div>
            <RecommendationWidget
              type="room"
              data={roomUpgradeData}
              onAction={(upgradedRoom) => onOpenBookingModalWithRoom(upgradedRoom)}
            />
          </div>
        )}

        {/* Featured Sanctuaries Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-widest mb-1">
                HANDCRAFTED ACCOMMODATIONS
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-100">
                Featured Suites & Private Villas
              </h2>
            </div>

            <button
              onClick={() => {
                setActiveCustomerPage('rooms');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>Explore All {rooms.length} Sanctuaries</span>
              <span>→</span>
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRooms.map((room) => {
              const isFavorited = customerFavorites.includes(room.number);

              return (
                <div
                  key={room.id}
                  className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-3xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/10 group"
                >
                  {/* Photo Container */}
                  <div className="relative h-56 overflow-hidden">
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

                    {/* Price Badge */}
                    <div className="absolute bottom-3 right-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl text-amber-400 font-extrabold text-sm border border-amber-500/30">
                      ${room.price} <span className="text-[10px] text-slate-400 font-normal">/ night</span>
                    </div>

                    {/* Favorite Heart Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteRoom(room.number);
                      }}
                      className="absolute top-3 right-3 p-2 rounded-xl bg-slate-950/75 hover:bg-slate-900 text-slate-300 hover:text-rose-400 backdrop-blur-md border border-slate-800 transition-colors"
                      title={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
                    >
                      <IconHeart size={18} filled={isFavorited} className={isFavorited ? 'text-rose-500' : ''} />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                        {room.category} • Floor {room.floor}
                      </div>
                      <h3 className="text-lg font-bold text-slate-100 mt-1">{room.name}</h3>

                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {room.amenities.slice(0, 3).map((am, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300"
                          >
                            ✓ {am}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => setSelectedRoomForDetails(room)}
                        className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold py-2.5 rounded-xl transition-colors"
                      >
                        View Details
                      </button>

                      <button
                        onClick={() => onOpenBookingModalWithRoom(room)}
                        className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-extrabold py-2.5 rounded-xl shadow-md shadow-amber-500/20 transition-all transform active:scale-95"
                      >
                        Reserve Stay
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Luxury Amenities Section */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
              UNPARALLELED EXCELLENCE
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-100">
              The Aurelia Resort Experience
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Every detail is meticulously curated to guarantee an unforgettable stay.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {amenitiesList.map((item, i) => (
              <div
                key={i}
                className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-5 space-y-3 hover:border-amber-500/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="text-sm font-bold text-slate-100">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Guest Testimonials Section */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
              DISTINGUISHED PATRONS
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-100">
              What Our Valued Guests Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:border-amber-500/30 transition-all shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, idx) => (
                      <IconStar key={idx} size={15} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    "{t.quote}"
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80">
                  <div className="font-bold text-xs text-slate-100">{t.author}</div>
                  <div className="text-[11px] text-slate-400">{t.location}</div>
                  <div className="text-[10px] text-amber-400 font-semibold mt-1">
                    Stayed in: {t.stay}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
