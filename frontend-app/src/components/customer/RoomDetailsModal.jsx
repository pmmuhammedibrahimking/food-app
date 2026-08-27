import React, { useState } from 'react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import {
  IconX,
  IconCrown,
  IconStar,
  IconUsers,
  IconBed,
  IconHeart,
  IconSparkles,
  IconCheckCircle,
  IconWifi,
  IconCoffee,
  IconTv,
  IconShield
} from '../Icons';

export const RoomDetailsModal = ({ onOpenBookingModalWithRoom }) => {
  const {
    selectedRoomForDetails,
    setSelectedRoomForDetails,
    customerFavorites,
    toggleFavoriteRoom,
    currentCustomer
  } = useCustomerAuth();

  const [nights, setNights] = useState(3);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  if (!selectedRoomForDetails) return null;

  const room = selectedRoomForDetails;
  const isFavorited = customerFavorites.includes(room.number);

  // Gallery photos
  const photos = [
    room.image,
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
  ];

  const basePrice = room.price * nights;
  const taxes = Math.round(basePrice * 0.12);
  const vipDiscount = currentCustomer?.vipStatus === 'Diamond' ? Math.round(basePrice * 0.15) : currentCustomer?.vipStatus === 'Gold' ? Math.round(basePrice * 0.10) : 0;
  const totalPrice = basePrice + taxes - vipDiscount;

  const handleBookNow = () => {
    setSelectedRoomForDetails(null);
    onOpenBookingModalWithRoom(room);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) setSelectedRoomForDetails(null);
      }}
    >
      <div className="relative w-full max-w-3xl bg-slate-900/95 backdrop-blur-2xl border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl space-y-4 text-slate-100 my-auto animate-scale-up max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20 flex-shrink-0">
              <IconCrown size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100">
                  {room.name}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Room {room.number}
                </span>
              </div>
              <p className="text-xs text-slate-400">{room.category} • Floor {room.floor}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavoriteRoom(room.number)}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-rose-400 transition-colors"
              title="Toggle Favorite"
            >
              <IconHeart size={18} filled={isFavorited} className={isFavorited ? 'text-rose-500' : ''} />
            </button>
            <button
              onClick={() => setSelectedRoomForDetails(null)}
              className="text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <IconX size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 space-y-6 text-xs overflow-y-auto flex-1 pr-4">
          {/* Main Photo & Thumbnails */}
          <div className="space-y-2">
            <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
              <img
                src={photos[selectedPhotoIndex]}
                alt={room.name}
                className="w-full h-full object-cover transition-transform duration-500"
              />
              <div className="absolute bottom-3 right-3 bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-amber-400 font-extrabold text-sm border border-amber-500/30">
                ${room.price} <span className="text-[10px] text-slate-400 font-normal">/ night</span>
              </div>
            </div>

            {/* Thumbnail selector */}
            <div className="grid grid-cols-4 gap-2">
              {photos.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`h-16 rounded-xl overflow-hidden border transition-all ${
                    selectedPhotoIndex === idx
                      ? 'border-amber-400 ring-2 ring-amber-400/30'
                      : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={p} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Key Specs Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-center">
            <div className="space-y-0.5">
              <div className="text-[10px] text-slate-400 font-bold uppercase">CAPACITY</div>
              <div className="text-sm font-bold text-slate-100">{room.capacity} Adults</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-[10px] text-slate-400 font-bold uppercase">CATEGORY</div>
              <div className="text-sm font-bold text-amber-400">{room.category}</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-[10px] text-slate-400 font-bold uppercase">FLOOR LEVEL</div>
              <div className="text-sm font-bold text-slate-100">Floor {room.floor}</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-[10px] text-slate-400 font-bold uppercase">STATUS</div>
              <div className="text-sm font-bold text-emerald-400">Available</div>
            </div>
          </div>

          {/* Luxury Amenities List */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Sanctuary Inclusions & Luxury Amenities
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {room.amenities.map((am, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-slate-200"
                >
                  <IconCheckCircle size={14} className="text-amber-400 flex-shrink-0" />
                  <span className="font-semibold text-[11px]">{am}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-slate-200">
                <IconWifi size={14} className="text-amber-400 flex-shrink-0" />
                <span className="font-semibold text-[11px]">Gigabit Fiber Wi-Fi</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-slate-200">
                <IconCoffee size={14} className="text-amber-400 flex-shrink-0" />
                <span className="font-semibold text-[11px]">Nespresso Coffee Bar</span>
              </div>
            </div>
          </div>

          {/* Pricing Calculator Card */}
          <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 text-xs">Estimated Stay Pricing Breakdown</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-xs">Nights:</span>
                <select
                  value={nights}
                  onChange={(e) => setNights(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 text-amber-400 font-bold px-2 py-1 rounded-lg text-xs"
                >
                  {[1, 2, 3, 4, 5, 7, 10, 14].map((n) => (
                    <option key={n} value={n}>
                      {n} Night{n > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800">
              <div className="flex justify-between">
                <span>Accommodation ({nights} nights @ ${room.price}/night):</span>
                <span className="text-slate-200 font-mono">${basePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Resort & Tourism Taxes (12%):</span>
                <span className="text-blue-400 font-mono">+${taxes.toLocaleString()}</span>
              </div>
              {vipDiscount > 0 && (
                <div className="flex justify-between text-amber-400 font-semibold">
                  <span>{currentCustomer?.vipStatus} VIP Member Discount:</span>
                  <span className="font-mono">-${vipDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-sm text-amber-400 pt-2 border-t border-slate-800">
                <span>Estimated Total:</span>
                <span>${totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-slate-800 bg-slate-950/90">
          <button
            onClick={() => setSelectedRoomForDetails(null)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors"
          >
            Back to Sanctuaries
          </button>

          <button
            onClick={handleBookNow}
            className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 text-xs font-extrabold px-6 py-3 rounded-xl shadow-lg shadow-amber-500/25 transition-all transform active:scale-95 flex items-center gap-2"
          >
            <IconSparkles size={16} />
            <span>Reserve Sanctuary Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
