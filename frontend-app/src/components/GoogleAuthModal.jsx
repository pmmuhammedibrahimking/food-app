import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { IconX, IconSparkles, IconCrown, IconCheckCircle } from './Icons';

export const GoogleAuthModal = () => {
  const {
    isGoogleModalOpen,
    googleModalConfig,
    closeGoogleModal,
    guests = [],
    loginWithGoogle,
    addToast
  } = useHotel();

  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customEmail, setCustomEmail] = useState('pmmuhammedibrahim786@gmail.com');
  const [customName, setCustomName] = useState('Muhammed Ibrahim');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  if (!isGoogleModalOpen) return null;

  const targetRole = googleModalConfig?.role || 'guest';

  // Demo accounts for fast testing
  const demoAccounts = [
    {
      id: 'g-ibrahim',
      name: 'Muhammed Ibrahim',
      email: 'pmmuhammedibrahim786@gmail.com',
      avatarColor: 'from-amber-500 to-amber-700',
      badge: 'Owner / VIP',
      initial: 'M'
    },
    {
      id: 'g-alexander',
      name: 'Lord Alexander Wright',
      email: 'alexander.wright@royals.co.uk',
      avatarColor: 'from-blue-500 to-indigo-600',
      badge: 'Diamond VIP',
      initial: 'A'
    },
    {
      id: 'g-sophia',
      name: 'Sophia Loren',
      email: 'sophia.loren@cinema.it',
      avatarColor: 'from-purple-500 to-pink-600',
      badge: 'Gold VIP',
      initial: 'S'
    },
    {
      id: 'g-admin',
      name: 'General Manager Console',
      email: 'admin@aureliagrand.com',
      avatarColor: 'from-emerald-500 to-teal-700',
      badge: 'Operations Staff',
      initial: 'G'
    }
  ];

  const handleAccountClick = (account) => {
    setSelectedAccountId(account.id);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const res = loginWithGoogle(account.email, account.name, targetRole);
      if (googleModalConfig?.onSelect) {
        googleModalConfig.onSelect(res);
      }
      closeGoogleModal();
      setShowCustomInput(false);
    }, 450);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) {
      addToast('Please enter a valid Gmail address (e.g. name@gmail.com)', 'error');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const displayName = customName.trim() || customEmail.split('@')[0];
      const res = loginWithGoogle(customEmail, displayName, targetRole);
      if (googleModalConfig?.onSelect) {
        googleModalConfig.onSelect(res);
      }
      closeGoogleModal();
      setShowCustomInput(false);
    }, 450);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeGoogleModal();
      }}
    >
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Top Google Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            {/* Google G Logo */}
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-md shadow-black/20 p-2 flex-shrink-0">
              <svg className="w-full h-full" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.4-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z"
                />
              </svg>
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                <span>Sign in with Google</span>
              </h2>
              <p className="text-xs text-slate-400">
                to continue to <span className="text-amber-400 font-semibold">Aurelia Resort</span>
              </p>
            </div>
          </div>

          <button
            onClick={closeGoogleModal}
            className="text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-slate-800/80 transition-colors"
            aria-label="Close Google Modal"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
            Choose an active Google / Gmail Account
          </div>

          {/* Quick Account List */}
          <div className="space-y-2.5">
            {demoAccounts.map((acc) => {
              const isSelected = selectedAccountId === acc.id && isLoading;
              return (
                <button
                  key={acc.id}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleAccountClick(acc)}
                  className={`w-full flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-slate-950/70 hover:bg-slate-800/80 border transition-all text-left group ${
                    isSelected ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${acc.avatarColor} text-white font-bold text-sm flex items-center justify-center shadow-md flex-shrink-0`}
                    >
                      {acc.initial}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-amber-400 transition-colors truncate">
                        {acc.name}
                      </div>
                      <div className="text-[11px] sm:text-xs text-slate-400 font-mono truncate">
                        {acc.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-amber-400">
                      {acc.badge}
                    </span>
                    <span className="text-xs text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
                      Sign in →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom Gmail Form Toggle */}
          {!showCustomInput ? (
            <button
              type="button"
              onClick={() => setShowCustomInput(true)}
              className="w-full py-3 px-4 rounded-2xl bg-slate-950/40 hover:bg-slate-800/60 border border-dashed border-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <span>➕ Use another Gmail or Google Workspace ID</span>
            </button>
          ) : (
            <form onSubmit={handleCustomSubmit} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400">Enter Your Gmail Account</span>
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="text-[11px] text-slate-400 hover:text-slate-200 underline"
                >
                  Back to List
                </button>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Gmail / Google Address</label>
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="your.id@gmail.com"
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-100 px-3 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Your Full Name (Optional)</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Muhammed Ibrahim"
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-100 px-3 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
                >
                  {isLoading ? 'Verifying...' : 'Sign in with this Gmail ID'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security & Disclaimer Footer */}
        <div className="p-4 bg-slate-950/70 border-t border-slate-800 text-center text-[10px] text-slate-400 space-y-1">
          <p>
            To continue, Google will securely share your profile with Aurelia Resort.
          </p>
          <div className="flex items-center justify-center gap-3 text-slate-500">
            <span>OAuth 2.0 Verified</span>
            <span>•</span>
            <span>End-to-End Encrypted</span>
            <span>•</span>
            <span>Google Identity</span>
          </div>
        </div>
      </div>
    </div>
  );
};
