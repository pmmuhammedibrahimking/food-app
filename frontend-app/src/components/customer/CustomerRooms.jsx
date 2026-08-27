import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import {
  IconSearch,
  IconFilter,
  IconHeart,
  IconUsers,
  IconBed,
  IconSparkles,
  IconStar
} from '../Icons';

export const CustomerRooms = ({ onOpenBookingModalWithRoom }) => {
  const { rooms } = useHotel();
  const {
    customerFavorites,
    toggleFavoriteRoom,
    setSelectedRoomForDetails
  } = useCustomerAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState(1600);
  const [sortBy, setSortBy] = useState('featured'); // 'featured' | 'price-low' | 'price-high' | 'capacity'

  const categories = ['All', 'Suite', 'Penthouse', 'Executive', 'Villa', 'Standard'];

  // Filter rooms
  const filteredRooms = rooms.filter((room) => {
    const matchesCategory = selectedCategory === 'All' || room.category === selectedCategory;
    const matchesPrice = room.price <= maxPrice;
    const matchesQuery =
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.amenities.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesPrice && matchesQuery;
  });

  // Sort rooms
  const sortedRooms = [...filteredRooms].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'capacity') return b.capacity - a.capacity;
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in font-sans">
      {/* Header Banner */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
          SANCTUARIES OF LUXURY
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-100">
          Suites, Penthouses & Private Villas
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Choose your dream coastal sanctuary equipped with bespoke furnishings, panoramic ocean balconies, and 24/7 dedicated butler service.
        </p>
      </div>

      {/* Filter & Search Controls Bar */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-4 sm:p-6 space-y-4 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Search Input */}
          <div className="relative">
            <IconSearch size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, view, or amenities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Price Range Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Max Price Per Night:</span>
              <span className="text-amber-400 font-bold font-mono">${maxPrice}</span>
            </div>
            <input
              type="range"
              min={100}
              max={1600}
              step={50}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-950 rounded-lg"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center justify-end gap-2">
            <span className="text-xs text-slate-400 font-semibold hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500/50 w-full sm:w-auto"
            >
              <option value="featured">Featured Suites</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="capacity">Capacity (Guests)</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-800/80 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div>
          Showing <span className="text-amber-400 font-bold">{sortedRooms.length}</span> luxury sanctuaries
        </div>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-amber-400 hover:underline text-xs"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Rooms Grid */}
      {sortedRooms.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
            <IconSearch size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-100">No Sanctuaries Match Your Search</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your price filter or search query to explore other available luxury accommodations.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setMaxPrice(1600);
            }}
            className="mt-2 px-4 py-2 bg-amber-400 text-slate-950 text-xs font-bold rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedRooms.map((room) => {
            const isFavorited = customerFavorites.includes(room.number);

            return (
              <div
                key={room.id}
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/10 group"
              >
                <div>
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
                    <div className="absolute bottom-3 right-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl text-amber-400 font-extrabold text-sm border border-amber-500/30 shadow-lg">
                      ${room.price} <span className="text-[10px] text-slate-400 font-normal">/ night</span>
                    </div>

                    {/* Category Pill */}
                    <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg text-slate-200 text-[10px] font-bold border border-slate-800 uppercase tracking-wider">
                      {room.category}
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
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <IconUsers size={14} className="text-amber-400" /> Max {room.capacity} Guests
                      </span>
                      <span>Floor {room.floor}</span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                      {room.name}
                    </h3>

                    {/* Amenities Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {room.amenities.map((am, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300"
                        >
                          ✓ {am}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-5 pt-0">
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80">
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
                      Reserve Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
