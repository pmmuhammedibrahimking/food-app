import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { useTranslation } from '../i18n/I18nContext';
import { IconSearch, IconPlus, IconGlobe, IconLogOut, IconMenu, IconSun, IconMoon, IconMoreVertical, IconX, IconCrown, IconClock } from './Icons';
import { NotificationCenter } from './NotificationCenter';

export const Header = ({ onOpenNewBookingModal, onToggleMobileSidebar, onOpenAuditLogsModal }) => {
  const { activeTab, portalMode, setPortalMode, currentUser, logoutAdmin, isSocketConnected, themeMode, toggleThemeMode } = useHotel();
  const { language, setLanguage, t } = useTranslation();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  return (
    <header className="header sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 w-full relative">
      {/* Top Header Row */}
      <div className="w-full flex items-center justify-between gap-2 px-3 sm:px-4 lg:px-6 h-14 sm:h-16 min-w-0">
        
        {/* Left: Mobile Sidebar Toggle + Brand / Search Bar */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 min-w-0">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors flex-shrink-0 h-9 w-9 flex items-center justify-center"
            aria-label="Toggle Navigation Sidebar"
          >
            <IconMenu size={18} />
          </button>


          {/* Tablet & Desktop Inline Search Bar (>= 768px) */}
          <div className="hidden md:flex items-center gap-2 bg-slate-950/90 border border-slate-800 hover:border-slate-700 focus-within:border-amber-500/60 focus-within:ring-2 focus-within:ring-amber-500/20 rounded-xl px-3 py-1.5 text-xs transition-all h-9 w-44 lg:w-64 xl:w-80 shadow-inner">
            <IconSearch size={14} className="text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search rooms, guests, bookings..."
              className="bg-transparent border-0 outline-none text-slate-100 placeholder-slate-500 w-full min-w-0 text-xs font-medium focus:outline-none focus:ring-0"
            />
            <kbd className="hidden xl:inline-block px-1.5 py-0.5 text-[9px] font-mono text-slate-500 bg-slate-900 border border-slate-800 rounded flex-shrink-0">⌘K</kbd>
          </div>
        </div>

        {/* Right Controls Container */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ml-auto">
          
          {/* Socket.io / Live REST Sync Status Badge */}
          {/* Desktop (>= 1280px): Full Badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-semibold flex-shrink-0">
            <span className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span className={isSocketConnected ? 'text-emerald-400' : 'text-amber-400'}>
              {isSocketConnected ? t('socketConnected') : t('restSync')}
            </span>
          </div>

          {/* Tablet (768px - 1279px): Compact Live Indicator */}
          <div 
            className="hidden md:flex xl:hidden items-center gap-1 px-2 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px] font-semibold flex-shrink-0 cursor-default"
            title={isSocketConnected ? "Realtime Socket Connected" : "Live REST Sync Active"}
          >
            <span className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span className={isSocketConnected ? 'text-emerald-400' : 'text-amber-400'}>Live</span>
          </div>

          {/* Language Switcher (Visible on Tablet & Desktop >= 640px) */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-xs flex-shrink-0 h-9">
            <IconGlobe size={13} className="text-amber-400 flex-shrink-0" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent border-none text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer pr-1"
              aria-label="Select Language"
            >
              <option value="en" className="bg-slate-900 text-slate-100">EN</option>
              <option value="hi" className="bg-slate-900 text-slate-100">HI</option>
            </select>
          </div>

          {/* Theme Mode Toggle (Visible on Tablet & Desktop >= 640px) */}
          <button
            onClick={toggleThemeMode}
            className="hidden sm:flex p-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 hover:text-amber-300 transition-colors items-center justify-center flex-shrink-0 h-9 w-9"
            title={`Switch to ${themeMode === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme Mode"
          >
            {themeMode === 'dark' ? <IconSun size={15} /> : <IconMoon size={15} />}
          </button>

          {/* Notification Bell (Visible on ALL Devices) */}
          <div className="flex-shrink-0">
            <NotificationCenter />
          </div>

          {/* Desktop Action Buttons (Inline >= 1024px) */}
          <div className="hidden lg:flex items-center gap-1.5">
            {(currentUser?.role?.toLowerCase() === 'admin' || currentUser?.role?.toLowerCase() === 'general manager') && (
              <button
                onClick={onOpenAuditLogsModal}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-amber-400 hover:text-amber-300 text-xs font-semibold px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition-all whitespace-nowrap h-9"
                title="View System Audit Logs"
              >
                <span className="hidden xl:inline">Audit Logs</span>
                <span className="xl:hidden">Audit</span>
              </button>
            )}

            <button
              onClick={onOpenNewBookingModal}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm transition-all whitespace-nowrap h-9"
            >
              <IconPlus size={14} />
              <span className="hidden sm:inline">New Reservation</span>
              <span className="sm:hidden">New</span>
            </button>

            <button
              onClick={() => setPortalMode(portalMode === 'admin' ? 'guest' : 'admin')}
              className="bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 text-xs font-semibold px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition-all whitespace-nowrap h-9"
              title="Switch between Staff and Guest Portal"
            >
              <IconGlobe size={13} />
              <span className="hidden xl:inline">{portalMode === 'admin' ? 'Guest Portal' : 'Admin Console'}</span>
              <span className="xl:hidden">Portal</span>
            </button>
          </div>

          {/* User Profile Avatar Section */}
          <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-800 flex-shrink-0">
            <div
              className="relative cursor-pointer hover:ring-2 hover:ring-amber-400/40 rounded-full transition-all"
              title={currentUser?.name || 'Administrator'}
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            >
              <img
                src={currentUser?.avatar || 'data:image/svg+xml;utf8,<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><circle cx="64" cy="64" r="64" fill="%23E2E8F0"/><circle cx="64" cy="46" r="22" fill="%23718096"/><path d="M22 108C22 84.804 40.804 66 64 66C87.196 66 106 84.804 106 108V114C106 114 90 124 64 124C38 124 22 114 22 114V108Z" fill="%23718096"/></svg>'}
                alt={currentUser?.name || 'Admin'}
                className="w-8 h-8 rounded-full object-cover border border-amber-400 shadow-sm"
              />
              <span className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-slate-950 border border-amber-400 rounded-full text-amber-400">
                <IconCrown size={8} />
              </span>
            </div>

            <div className="hidden xl:block min-w-0">
              <div className="text-xs font-bold text-slate-100 leading-tight truncate max-w-[110px]">
                {currentUser?.name || 'Administrator'}
              </div>
              <div className="text-[10px] text-amber-400 font-medium truncate">
                {currentUser?.role || 'Admin'}
              </div>
            </div>

            <button
              onClick={logoutAdmin}
              title="Logout Admin"
              className="hidden lg:flex bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold p-2 rounded-xl items-center gap-1 transition-all flex-shrink-0 h-9 w-9 justify-center"
              aria-label="Logout"
            >
              <IconLogOut size={14} />
            </button>
          </div>

          {/* More (⋮) Menu Button for Tablet & Mobile (< 1024px) */}
          <button
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 hover:text-amber-300 transition-colors h-9 w-9 flex items-center justify-center flex-shrink-0"
            title="More Actions"
            aria-label="Open More Actions Menu"
          >
            {isMoreMenuOpen ? <IconX size={16} /> : <IconMoreVertical size={18} />}
          </button>
        </div>
      </div>

      {/* Dedicated Mobile Search Bar (< 768px: Mobile S, M, L, iPhones) */}
      <div className="md:hidden px-3 pb-2.5 pt-0.5 animate-fade-in">
        <div className="flex items-center gap-2 bg-slate-950/90 border border-slate-800 hover:border-slate-700 focus-within:border-amber-500/60 focus-within:ring-2 focus-within:ring-amber-500/20 rounded-xl px-3 py-1.5 text-xs transition-all h-9 w-full shadow-inner">
          <IconSearch size={14} className="text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search rooms, guests, bookings..."
            className="bg-transparent border-0 outline-none text-slate-100 placeholder-slate-500 w-full min-w-0 text-xs font-medium focus:outline-none focus:ring-0"
          />
        </div>
      </div>

      {/* Tablet & Mobile More (⋮) Backdrop & Dropdown Action Menu (< 1024px) */}
      {isMoreMenuOpen && (
        <>
          {/* Full Screen Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMoreMenuOpen(false)}
          />

          {/* Full-width Dropdown Menu directly attached below the header bar */}
          <div className="absolute top-full left-0 right-0 w-full z-50 lg:hidden bg-slate-950/98 border-b border-amber-500/30 backdrop-blur-2xl shadow-2xl p-3.5 sm:p-4 animate-slide-down">
            <div className="max-w-xl mx-auto space-y-3">
              {/* User Profile Mini Card */}
              <div className="flex items-center justify-between p-3 bg-slate-900/90 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-sm shadow-md flex-shrink-0">
                    {currentUser?.name ? currentUser.name.charAt(0) : 'G'}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-slate-100 leading-tight truncate">
                      {currentUser?.name || 'General Manager'}
                    </div>
                    <div className="text-[10px] sm:text-xs text-amber-400 font-medium truncate">
                      {currentUser?.role || 'Manager'} • {currentUser?.email || 'admin@aurelia.com'}
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px] sm:text-xs font-semibold flex-shrink-0">
                  <span className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                  <span className={isSocketConnected ? 'text-emerald-400' : 'text-amber-400'}>
                    {isSocketConnected ? 'Live Socket' : 'REST Sync'}
                  </span>
                </div>
              </div>

              {/* Mobile Quick Controls Bar (Language & Theme Toggle for Mobile Screens < 640px) */}
              <div className="sm:hidden flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl p-2">
                {/* Language Picker */}
                <div className="flex-1 flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs">
                  <IconGlobe size={14} className="text-amber-400 flex-shrink-0" />
                  <span className="text-slate-400 font-medium">Language:</span>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-transparent border-none text-slate-100 font-bold focus:outline-none cursor-pointer pr-1 ml-auto text-xs"
                  >
                    <option value="en" className="bg-slate-900 text-slate-100">English (EN)</option>
                    <option value="hi" className="bg-slate-900 text-slate-100">Hindi (HI)</option>
                  </select>
                </div>

                {/* Theme Mode Toggle */}
                <button
                  onClick={toggleThemeMode}
                  className="flex items-center gap-2 bg-slate-950 border border-slate-800 text-amber-400 hover:text-amber-300 rounded-lg px-3 py-2 text-xs font-semibold"
                  title={`Switch to ${themeMode === 'dark' ? 'Light' : 'Dark'} Mode`}
                >
                  {themeMode === 'dark' ? <IconSun size={14} /> : <IconMoon size={14} />}
                  <span>{themeMode === 'dark' ? 'Light' : 'Dark'}</span>
                </button>
              </div>

              {/* Quick Action Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    onOpenNewBookingModal();
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold p-3 rounded-xl flex items-center justify-center gap-2 min-h-[44px] shadow-sm transition-all"
                >
                  <IconPlus size={16} />
                  <span>New Reservation</span>
                </button>

                <button
                  onClick={() => {
                    setPortalMode(portalMode === 'admin' ? 'guest' : 'admin');
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 active:scale-[0.98] font-semibold p-3 rounded-xl flex items-center justify-center gap-2 min-h-[44px] transition-all"
                >
                  <IconGlobe size={16} />
                  <span>{portalMode === 'admin' ? 'Switch to Guest Portal' : 'Switch to Admin Console'}</span>
                </button>

                <button
                  onClick={() => {
                    onOpenAuditLogsModal();
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-800 active:scale-[0.98] border border-slate-800 text-amber-400 font-semibold p-3 rounded-xl flex items-center justify-center gap-2 min-h-[44px] transition-all"
                >
                  <IconClock size={16} />
                  <span>System Audit Logs</span>
                </button>

                <button
                  onClick={() => {
                    logoutAdmin();
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full bg-rose-500/10 hover:bg-rose-500/20 active:scale-[0.98] border border-rose-500/30 text-rose-400 font-semibold p-3 rounded-xl flex items-center justify-center gap-2 min-h-[44px] transition-all"
                >
                  <IconLogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

