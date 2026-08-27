import React, { useState, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { IconCrown, IconSparkles, IconX, IconGlobe, IconCheckCircle, IconUsers } from './Icons';

export const AuthModal = () => {
  const {
    isAuthModalOpen,
    authModalConfig,
    closeAuthModal,
    openGoogleModal,
    loginGuest,
    registerGuest,
    loginAdmin,
    registerAdmin,
    guests = [],
    addToast
  } = useHotel();

  const [roleMode, setRoleMode] = useState('guest'); // 'guest' | 'admin'
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  
  // Guest inputs
  const [email, setEmail] = useState('pmmuhammedibrahim786@gmail.com');
  const [bookingId, setBookingId] = useState('BK-7860');
  const [guestName, setGuestName] = useState('Muhammed Ibrahim');
  const [phone, setPhone] = useState('+1 (555) 786-0199');
  
  // Staff inputs
  const [staffEmail, setStaffEmail] = useState('pmmuhammedibrahim786@gmail.com');
  const [staffPassword, setStaffPassword] = useState('adminpassword123');
  const [staffName, setStaffName] = useState('Muhammed Ibrahim');
  const [staffRole, setStaffRole] = useState('Manager');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (authModalConfig) {
      if (authModalConfig.initialRole) setRoleMode(authModalConfig.initialRole);
      if (authModalConfig.initialMode) setAuthMode(authModalConfig.initialMode);
    }
  }, [authModalConfig, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleGuestSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (authMode === 'login') {
      if (!email || !email.includes('@')) {
        setError('Please enter a valid guest email address.');
        return;
      }
      setIsSubmitting(true);
      const success = loginGuest(email, bookingId);
      setIsSubmitting(false);

      if (success) {
        if (addToast) addToast(`Welcome to Aurelia Guest Lounge, ${email}!`, 'success');
        closeAuthModal();
      } else {
        setError('Could not complete guest sign in. Please verify your details.');
      }
    } else {
      if (!guestName || !email) {
        setError('Full Name and Email Address are required to register.');
        return;
      }
      setIsSubmitting(true);
      const res = await registerGuest({ name: guestName, email, phone });
      setIsSubmitting(false);

      if (res && res.success) {
        if (addToast) addToast(`Welcome to Aurelia Resort, ${guestName}!`, 'success');
        closeAuthModal();
      } else {
        setError(res?.message || 'Failed to create guest account.');
      }
    }
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (authMode === 'login') {
      if (!staffEmail || !staffPassword) {
        setError('Please enter staff email address and password.');
        return;
      }
      setIsSubmitting(true);
      const success = await loginAdmin(staffEmail, staffPassword);
      setIsSubmitting(false);

      if (success) {
        if (addToast) addToast(`Staff authenticated as ${staffEmail}!`, 'success');
        closeAuthModal();
      } else {
        setError('Invalid staff credentials. Try the quick demo accounts below.');
      }
    } else {
      if (!staffName || !staffEmail || !staffPassword) {
        setError('Please fill in all required fields for staff registration.');
        return;
      }
      setIsSubmitting(true);
      const res = await registerAdmin({
        name: staffName,
        email: staffEmail,
        password: staffPassword,
        role: staffRole
      });
      setIsSubmitting(false);

      if (res && res.success) {
        if (addToast) addToast(`Staff account registered for ${staffName}!`, 'success');
        closeAuthModal();
      } else {
        setError(res?.message || 'Failed to register staff account.');
      }
    }
  };

  const handleGoogleSignIn = () => {
    closeAuthModal();
    openGoogleModal({
      role: roleMode,
      onSelect: () => {}
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div className="relative w-full max-w-lg bg-slate-900/95 backdrop-blur-2xl border border-amber-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4 text-slate-100 my-auto animate-scale-up">
        {/* Top Header & Close */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20 flex-shrink-0">
              <IconCrown size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-serif text-slate-100">
                  AURELIA GRAND RESORT
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  5★ Luxury
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {roleMode === 'guest' ? 'Customer Guest Portal & Digital Folio Access' : 'Staff Operations Console'}
              </p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Portal Switcher Pill (Guest vs Staff) */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setRoleMode('guest');
              setError('');
            }}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              roleMode === 'guest'
                ? 'bg-amber-400 text-slate-950 font-extrabold shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🌴 Customer Guest Portal</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRoleMode('admin');
              setError('');
            }}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              roleMode === 'admin'
                ? 'bg-amber-400 text-slate-950 font-extrabold shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🏢 Staff & Operations</span>
          </button>
        </div>

        {/* Mode Tabs: Sign In vs Sign Up */}
        <div className="flex border-b border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setError('');
            }}
            className={`flex-1 pb-2.5 transition-colors border-b-2 ${
              authMode === 'login'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In with Email / Code
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setError('');
            }}
            className={`flex-1 pb-2.5 transition-colors border-b-2 ${
              authMode === 'register'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {roleMode === 'guest' ? 'New Guest Registration' : 'New Staff Sign Up'}
          </button>
        </div>

        {/* Error Notification Alert */}
        {error && (
          <div className="bg-rose-500/15 border border-rose-500/40 text-rose-300 p-3 rounded-xl text-xs flex items-center justify-between gap-2">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-rose-400 hover:text-rose-200">
              <IconX size={14} />
            </button>
          </div>
        )}

        {/* One-Click Google / Gmail Sign In Button */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-100 text-xs font-bold py-3 px-4 rounded-xl transition-all shadow-md group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:scale-110 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.9 5 12 5z" />
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
              <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-2.9z" />
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.4-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z" />
            </svg>
            <span>One-Click Sign In with Google / Gmail ID</span>
          </button>

          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[10px] uppercase font-bold text-slate-400 tracking-widest absolute">
              OR DIRECT CREDENTIALS
            </span>
          </div>
        </div>

        {/* GUEST FORM */}
        {roleMode === 'guest' && (
          <form onSubmit={handleGuestSubmit} className="space-y-3 text-xs">
            {authMode === 'register' && (
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Guest Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muhammed Ibrahim"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-300">Guest Gmail / Email</label>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('pmmuhammedibrahim786@gmail.com');
                    setBookingId('BK-7860');
                    setError('Auto-filled: pmmuhammedibrahim786@gmail.com');
                  }}
                  className="text-[10px] text-amber-400 hover:text-amber-300 font-bold underline"
                >
                  Auto-Fill
                </button>
              </div>
              <input
                type="text"
                required
                placeholder="e.g. ibrahim or guest@resort.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            {authMode === 'register' && (
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+1 (555) 786-0199"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 font-mono"
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-300">Reservation Folio Code (Optional)</label>
                <span className="text-[10px] text-slate-400">e.g. BK-7860</span>
              </div>
              <input
                type="text"
                placeholder="BK-7860"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-extrabold py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <IconSparkles size={16} />
              <span>{isSubmitting ? 'Authenticating...' : authMode === 'login' ? 'Sign In to Guest Lounge' : 'Create Guest Profile'}</span>
            </button>
          </form>
        )}

        {/* STAFF FORM */}
        {roleMode === 'admin' && (
          <form onSubmit={handleStaffSubmit} className="space-y-3 text-xs">
            {authMode === 'register' && (
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Staff Member Name</label>
                <input
                  type="text"
                  required
                  placeholder="Muhammed Ibrahim"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Staff Username or Email / Gmail *</label>
              <input
                type="text"
                required
                placeholder="e.g. manager or pmmuhammedibrahim786@gmail.com"
                value={staffEmail}
                onChange={(e) => setStaffEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-300">Staff Security Password</label>
                <span className="text-[10px] text-slate-400">adminpassword123</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 pr-14 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[11px] text-slate-400 hover:text-slate-200 font-semibold"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {authMode === 'register' && (
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Assigned Role</label>
                <select
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="Manager">General Manager</option>
                  <option value="Receptionist">Front Desk Receptionist</option>
                  <option value="Housekeeping">Housekeeping Supervisor</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-extrabold py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all transform active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Authenticating...' : authMode === 'login' ? `Sign In as ${staffRole}` : `Register New ${staffRole} Account`}
            </button>
          </form>
        )}

        {/* Fast VIP Account Cards */}
        <div className="pt-2 border-t border-slate-800 space-y-1.5">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            {roleMode === 'guest' ? '1-Click VIP Guest Sign In Profiles:' : '1-Click Staff Roles:'}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {roleMode === 'guest' ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    loginGuest('pmmuhammedibrahim786@gmail.com', 'BK-7860');
                    if (addToast) addToast('Welcome back, Muhammed Ibrahim (Diamond VIP)!', 'success');
                    closeAuthModal();
                  }}
                  className="bg-slate-950 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-400 p-2.5 rounded-xl text-left transition-all group"
                >
                  <div className="text-[11px] font-bold text-slate-100 group-hover:text-amber-400 truncate flex items-center gap-1">
                    <span>Muhammed Ibrahim</span>
                    <span className="text-[9px] text-amber-400">👑</span>
                  </div>
                  <div className="text-[9px] text-amber-400 font-semibold truncate">Penthouse 401 • Diamond VIP</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    loginGuest('alexander.wright@royals.co.uk', 'BK-9021');
                    if (addToast) addToast('Welcome back, Lord Alexander (Gold VIP)!', 'success');
                    closeAuthModal();
                  }}
                  className="bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 p-2.5 rounded-xl text-left transition-all group"
                >
                  <div className="text-[11px] font-bold text-slate-100 group-hover:text-amber-400 truncate">
                    Lord Alexander
                  </div>
                  <div className="text-[9px] text-slate-400 truncate">Room 401 • Gold VIP</div>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    loginAdmin('pmmuhammedibrahim786@gmail.com', 'adminpassword123');
                    if (addToast) addToast('Logged in as General Manager!', 'success');
                    closeAuthModal();
                  }}
                  className="bg-slate-950 hover:bg-slate-800 border border-amber-500/30 p-2 rounded-xl text-center transition-all"
                >
                  <div className="text-[10px] font-bold text-amber-400">General Manager</div>
                  <div className="text-[9px] text-slate-400 truncate">Muhammed Ibrahim</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    loginAdmin('pmmuhammedibrahim786@gmail.com', 'receptionpassword123');
                    if (addToast) addToast('Logged in as Front Desk Receptionist!', 'success');
                    closeAuthModal();
                  }}
                  className="bg-slate-950 hover:bg-slate-800 border border-slate-800 p-2 rounded-xl text-center transition-all"
                >
                  <div className="text-[10px] font-bold text-emerald-400">Front Desk</div>
                  <div className="text-[9px] text-slate-400 truncate">Receptionist Console</div>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
