import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { IconX } from './Icons';

export const GoogleAuthModal = () => {
  const {
    isGoogleModalOpen,
    googleModalConfig,
    closeGoogleModal,
    loginWithGoogle,
    addToast
  } = useHotel();

  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [step, setStep] = useState('email'); // 'email' | 'password'
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  if (!isGoogleModalOpen) return null;

  const targetRole = googleModalConfig?.role || 'guest';

  // Accounts matching user's exact Google Sign-In Chooser screen
  const accounts = [
    {
      id: 'acc-ibrahim',
      name: 'PM MUHAMMED IBRAHIM',
      email: 'pmmuhammedibrahim786@gmail.com',
      avatarBg: 'bg-[#8e24aa]', // Purple avatar matching screenshot
      avatarText: 'P',
      isImage: false
    },
    {
      id: 'acc-student-1',
      name: 'student Occ94c82',
      email: 'student-01-cabee9eddd3e@qwiklabs.net',
      avatarBg: 'bg-[#5f6368]',
      avatarText: null,
      isImage: true
    },
    {
      id: 'acc-student-2',
      name: 'student 2187d37f',
      email: 'student-03-f61f906195fa@qwiklabs.net',
      avatarBg: 'bg-[#5f6368]',
      avatarText: null,
      isImage: true
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
      if (addToast) {
        addToast(`Signed in as ${account.name} (${account.email})`, 'success');
      }
    }, 450);
  };

  const handleCustomEmailNext = (e) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) {
      if (addToast) addToast('Enter a valid email or phone', 'error');
      return;
    }
    setStep('password');
  };

  const handleCustomPasswordSubmit = (e) => {
    e.preventDefault();
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
      setStep('email');
      if (addToast) {
        addToast(`Signed in with Google as ${displayName}!`, 'success');
      }
    }, 500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-fade-in font-sans"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeGoogleModal();
      }}
    >
      {/* Outer Google Window Card Container */}
      <div className="relative w-full max-w-2xl sm:max-w-3xl bg-[#1e1f20] border border-[#444746]/50 rounded-[28px] shadow-2xl overflow-hidden text-[#e3e3e3] flex flex-col animate-scale-up">
        
        {/* Top Minimal Google Bar */}
        <div className="px-6 sm:px-8 pt-6 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Multicolored Google G Logo */}
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span className="text-sm font-medium text-[#e3e3e3]">Sign in with Google</span>
          </div>

          <button
            onClick={closeGoogleModal}
            className="text-[#c4c7c5] hover:text-white p-1.5 rounded-full hover:bg-[#333538] transition-colors"
            aria-label="Close"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Main Content Area: Authentic Two-Column Google Layout */}
        <div className="px-6 sm:px-8 py-6 sm:py-8 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 min-h-[340px]">
          
          {/* Left Column: Heading & Service Info */}
          <div className="flex flex-col justify-start">
            <h1 className="text-2xl sm:text-3xl font-normal text-[#e3e3e3] tracking-normal font-sans leading-tight">
              {showCustomInput ? (step === 'email' ? 'Sign in' : 'Welcome') : 'Choose an account'}
            </h1>
            <p className="text-sm text-[#c4c7c5] mt-3">
              to continue to <span className="text-[#a8c7fa] font-medium cursor-pointer hover:underline">futureskillprime.in</span>
            </p>

            {isLoading && (
              <div className="mt-8 flex items-center gap-3 text-xs text-[#a8c7fa] animate-pulse">
                <div className="w-4 h-4 rounded-full border-2 border-[#a8c7fa] border-t-transparent animate-spin" />
                <span>Authenticating with Google Accounts...</span>
              </div>
            )}
          </div>

          {/* Right Column: Account List or Custom Input */}
          <div className="flex flex-col justify-center">
            {!showCustomInput ? (
              <div className="space-y-1">
                {/* Account Rows */}
                {accounts.map((acc) => {
                  const isSelected = selectedAccountId === acc.id && isLoading;
                  return (
                    <div
                      key={acc.id}
                      onClick={() => handleAccountClick(acc)}
                      className={`flex items-center gap-3.5 p-3 rounded-2xl cursor-pointer hover:bg-[#282a2d] transition-colors ${
                        isSelected ? 'bg-[#282a2d] ring-1 ring-[#a8c7fa]' : ''
                      }`}
                    >
                      {/* Avatar */}
                      {acc.isImage ? (
                        <div className="w-8 h-8 rounded-full bg-[#444746] flex items-center justify-center text-[#c4c7c5] flex-shrink-0">
                          <svg className="w-5 h-5 text-[#8e918f]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        </div>
                      ) : (
                        <div
                          className={`w-8 h-8 rounded-full ${acc.avatarBg} text-white font-medium text-sm flex items-center justify-center flex-shrink-0`}
                        >
                          {acc.avatarText}
                        </div>
                      )}

                      {/* Name & Email */}
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-[#e3e3e3] truncate">
                          {acc.name}
                        </div>
                        <div className="text-xs text-[#c4c7c5] font-normal truncate font-sans">
                          {acc.email}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Subtle Divider */}
                <div className="border-t border-[#444746]/50 my-2" />

                {/* Use Another Account Button */}
                <div
                  onClick={() => setShowCustomInput(true)}
                  className="flex items-center gap-3.5 p-3 rounded-2xl cursor-pointer hover:bg-[#282a2d] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#c4c7c5] flex-shrink-0">
                    <svg className="w-5 h-5 text-[#c4c7c5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-[#e3e3e3]">Use another account</span>
                </div>
              </div>
            ) : (
              /* Custom Account Entry Form */
              <div className="space-y-4 animate-fade-in">
                {step === 'email' ? (
                  <form onSubmit={handleCustomEmailNext} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        autoFocus
                        required
                        placeholder="Email or phone"
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        className="w-full bg-transparent border border-[#8e918f] focus:border-[#a8c7fa] focus:ring-1 focus:ring-[#a8c7fa] rounded-lg px-3.5 py-3 text-sm text-[#e3e3e3] placeholder-[#8e918f] outline-none transition-all"
                      />
                      <div className="mt-1 text-right">
                        <button
                          type="button"
                          onClick={() => setCustomEmail('pmmuhammedibrahim786@gmail.com')}
                          className="text-xs text-[#a8c7fa] hover:underline font-medium"
                        >
                          Forgot email?
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-[#c4c7c5]">
                      Not your computer? Use Guest mode to sign in privately.{' '}
                      <span className="text-[#a8c7fa] hover:underline cursor-pointer">Learn more</span>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <button
                        type="button"
                        onClick={() => setShowCustomInput(false)}
                        className="text-sm font-medium text-[#a8c7fa] hover:bg-[#333538]/50 px-3 py-2 rounded-full transition-colors"
                      >
                        Back
                      </button>

                      <button
                        type="submit"
                        className="bg-[#a8c7fa] hover:bg-[#8ab4f8] text-[#041e49] font-medium text-sm px-6 py-2 rounded-full transition-all"
                      >
                        Next
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleCustomPasswordSubmit} className="space-y-4">
                    {/* User Chip */}
                    <div
                      onClick={() => setStep('email')}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#444746] bg-[#282a2d] text-xs text-[#e3e3e3] cursor-pointer hover:bg-[#333538]"
                    >
                      <div className="w-5 h-5 rounded-full bg-[#8e24aa] text-white text-[10px] flex items-center justify-center">
                        {customEmail.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate max-w-[160px]">{customEmail}</span>
                      <svg className="w-3 h-3 text-[#c4c7c5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    <div>
                      <input
                        type="password"
                        autoFocus
                        required
                        placeholder="Enter your password"
                        value={customPassword}
                        onChange={(e) => setCustomPassword(e.target.value)}
                        className="w-full bg-transparent border border-[#8e918f] focus:border-[#a8c7fa] focus:ring-1 focus:ring-[#a8c7fa] rounded-lg px-3.5 py-3 text-sm text-[#e3e3e3] placeholder-[#8e918f] outline-none transition-all"
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Your full name (optional)"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="w-full bg-transparent border border-[#444746] focus:border-[#a8c7fa] rounded-lg px-3.5 py-2.5 text-xs text-[#e3e3e3] placeholder-[#8e918f] outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <button
                        type="button"
                        onClick={() => setStep('email')}
                        className="text-sm font-medium text-[#a8c7fa] hover:bg-[#333538]/50 px-3 py-2 rounded-full transition-colors"
                      >
                        Back
                      </button>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-[#a8c7fa] hover:bg-[#8ab4f8] text-[#041e49] font-medium text-sm px-6 py-2 rounded-full transition-all"
                      >
                        {isLoading ? 'Signing in...' : 'Sign in'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Authentic Google Footer Bar */}
        <div className="px-6 sm:px-8 py-4 bg-[#1e1f20] border-t border-[#444746]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8e918f]">
          {/* Language Selector */}
          <div className="flex items-center gap-1 cursor-pointer hover:text-[#c4c7c5] transition-colors">
            <span>English (United States)</span>
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </div>

          {/* Legal Links */}
          <div className="flex items-center gap-6 text-[#8e918f]">
            <span className="hover:text-[#c4c7c5] cursor-pointer transition-colors">Help</span>
            <span className="hover:text-[#c4c7c5] cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-[#c4c7c5] cursor-pointer transition-colors">Terms</span>
          </div>
        </div>
      </div>
    </div>
  );
};

