import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { IconCrown, IconSparkles, IconGlobe, IconCheckCircle, IconX } from './Icons';

export const UserLogin = () => {
  const { loginGuest, registerGuest, setPortalMode, guests = [], openGoogleModal, addToast } = useHotel();
  const [email, setEmail] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      if (!email) {
        setError('Please enter your guest username or email address.');
        return;
      }
      setIsSubmitting(true);
      const success = loginGuest(email, bookingId);
      setIsSubmitting(false);

      if (!success) {
        setError('Unable to authenticate guest profile. Please try demo accounts below.');
      }
    } else {
      if (!guestName || !email) {
        setError('Please enter your full name and email to register.');
        return;
      }
      setIsSubmitting(true);
      const res = await registerGuest({ name: guestName, email, phone });
      setIsSubmitting(false);

      if (!res || !res.success) {
        setError(res?.message || 'Failed to complete registration.');
      }
    }
  };

  const handleQuickVipLogin = (guestObj) => {
    setError('');
    setEmail(guestObj.email);
    setBookingId('BK-9021');
    loginGuest(guestObj.email, 'BK-9021');
  };

  const handleOpenGoogleModal = () => {
    setError('');
    openGoogleModal({
      role: 'guest',
      onSelect: (res) => {
        if (res?.guest?.name) {
          addToast(`Logged in as ${res.guest.name}!`, 'success');
        }
      }
    });
  };

  return (
    <div className="relative min-h-[90vh] sm:min-h-screen w-full flex items-center justify-center p-3 sm:p-6 lg:p-8 overflow-hidden text-slate-100 font-sans">
      {/* Luxury Resort Background with Blur */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-1000"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80')`
        }}
      />

      {/* Dark Luxury Overlays */}
      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-md" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

      {/* Ambient Gradient Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      {/* Main Glassmorphism Form Card */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/85 backdrop-blur-2xl border border-amber-500/30 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-5 my-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
            <IconCrown size={30} />
          </div>

          <h1 className="text-2xl font-bold font-serif tracking-wide text-slate-100">
            AURELIA RESORT
          </h1>
          <p className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
            Guest Experience & Concierge Portal
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex bg-slate-950/90 p-1 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Guest Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'register'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            New Registration
          </button>
        </div>

        {/* Error Notification Alert */}
        {error && (
          <div className="bg-rose-500/15 border border-rose-500/40 text-rose-300 p-3.5 rounded-xl text-xs flex items-center justify-between gap-2 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-rose-400 hover:text-rose-200">
              <IconX size={14} />
            </button>
          </div>
        )}

        {/* Google Social Sign In */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleOpenGoogleModal}
            className="w-full flex items-center justify-center gap-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.9 5 12 5z" />
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
              <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-2.9z" />
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.4-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z" />
            </svg>
            <span>Continue with Google / Gmail ID</span>
          </button>

          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[10px] uppercase font-bold text-slate-500 tracking-widest absolute">
              OR WITH GUEST EMAIL
            </span>
          </div>
        </div>

        {/* Login / Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'register' && (
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Lord Alexander Wright"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-300">Guest Username or Email / Gmail</label>
              <button
                type="button"
                onClick={() => {
                  setEmail('alexander.wright@royals.co.uk');
                  setError('Auto-filled: alexander.wright@royals.co.uk');
                }}
                className="text-[10px] text-amber-400 hover:text-amber-300 font-bold underline"
              >
                Auto-Fill
              </button>
            </div>
            <input
              type="text"
              placeholder="e.g. alexander or guest@resort.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+44 7911 123456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-300">Reservation Code (Optional)</label>
              <button
                type="button"
                onClick={() => {
                  setBookingId('BK-9021');
                  setError('Auto-filled Code: BK-9021');
                }}
                className="text-[10px] text-amber-400 hover:text-amber-300 font-bold underline"
              >
                Forgot Booking ID?
              </button>
            </div>
            <input
              type="text"
              placeholder="e.g. BK-9021"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-extrabold py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all transform active:scale-95 disabled:opacity-50"
          >
            {isSubmitting
              ? 'Connecting...'
              : mode === 'login'
              ? 'Access Guest Lounge & Vouchers'
              : 'Create Guest Profile'}
          </button>
        </form>

        {/* Quick Fast Demo VIP Login Section */}
        <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider text-center">
            FAST DEMO VIP GUEST LOGIN:
          </div>

          <div className="space-y-1.5">
            {guests.slice(0, 2).map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => handleQuickVipLogin(g)}
                className="w-full flex items-center justify-between bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold p-2.5 rounded-xl transition-all"
              >
                <div className="flex items-center gap-2">
                  <IconSparkles size={14} className="text-amber-400" />
                  <span>{g.name}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {g.vipStatus} VIP
                </span>
              </button>
            ))}
          </div>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => setPortalMode('admin')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <IconGlobe size={14} />
              <span>Switch to Staff Operations Console</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
