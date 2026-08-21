import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { useTranslation } from '../i18n/I18nContext';
import { IconSearch, IconPlus, IconGlobe, IconLogOut, IconMenu, IconSun, IconMoon, IconMoreVertical, IconX } from './Icons';
import { NotificationCenter } from './NotificationCenter';

export const Header = ({ onOpenNewBookingModal, onToggleMobileSidebar, onOpenAuditLogsModal }) => {
  const { activeTab, portalMode, setPortalMode, currentUser, logoutAdmin, isSocketConnected, themeMode, toggleThemeMode } = useHotel();
  const { language, setLanguage, t } = useTranslation();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);



  return (
    <header className="header sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3">
      {/* Enterprise Single-Row Header Container */}
      <div className="flex items-center justify-between gap-2 sm:gap-3 lg:gap-4 w-full">
        
        {/* Left: Mobile Toggle + Sleek Search Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-md min-w-0">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white transition-colors flex-shrink-0 h-9 w-9 flex items-center justify-center"
            aria-label="Toggle Navigation Sidebar"
          >
            <IconMenu size={18} />
          </button>

          {/* Sleek Search Bar */}
          <div className="header-search-bar hidden sm:flex items-center gap-2.5 bg-slate-950/90 border border-slate-800 hover:border-slate-700 focus-within:border-amber-500/60 focus-within:ring-2 focus-within:ring-amber-500/20 rounded-xl px-3.5 py-1.5 text-xs transition-all h-9 w-full max-w-sm shadow-inner">
            <IconSearch size={15} className="text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search rooms, guests, bookings..."
              className="bg-transparent border-0 outline-none text-slate-100 placeholder-slate-500 w-full min-w-0 text-xs font-medium focus:outline-none focus:ring-0"
            />
            <kbd className="hidden xl:inline-block px-1.5 py-0.5 text-[9px] font-mono text-slate-500 bg-slate-900 border border-slate-800 rounded flex-shrink-0">⌘K</kbd>
          </div>
        </div>

        {/* Right Controls Container (Guaranteed ZERO right-edge overflow on all screens) */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ml-auto">
          
          {/* Socket.io Live Status Badge (Visible ONLY on >= 1536px Ultra-wide) */}
          <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-semibold flex-shrink-0">
            <span className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span className={isSocketConnected ? 'text-emerald-400' : 'text-amber-400'}>
              {isSocketConnected ? t('socketConnected') : t('restSync')}
            </span>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-xs flex-shrink-0 h-9">
            <IconGlobe size={13} className="text-amber-400 flex-shrink-0" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent border-none text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer pr-1"
            >
              <option value="en" className="bg-slate-900 text-slate-100">EN</option>
              <option value="hi" className="bg-slate-900 text-slate-100">HI</option>
            </select>
          </div>

          {/* Theme Mode Toggle */}
          <button
            onClick={toggleThemeMode}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 hover:text-amber-300 transition-colors flex items-center justify-center flex-shrink-0 h-9 w-9"
            title={`Switch to ${themeMode === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {themeMode === 'dark' ? <IconSun size={15} /> : <IconMoon size={15} />}
          </button>

          {/* Notification Bell */}
          <div className="flex-shrink-0">
            <NotificationCenter />
          </div>

          {/* Desktop & Laptop Action Buttons (Inline >= 1024px) */}
          <div className="hidden lg:flex items-center gap-1.5">
            <button
              onClick={onOpenAuditLogsModal}
              className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-amber-400 hover:text-amber-300 text-xs font-semibold px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition-all whitespace-nowrap h-9"
              title="View System Audit Logs"
            >
              <span className="hidden xl:inline">Audit Logs</span>
              <span className="xl:hidden">Audit</span>
            </button>

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
          <div className="flex items-center gap-2 pl-1.5 lg:pl-2 border-l border-slate-800 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold text-xs shadow-sm flex-shrink-0 cursor-pointer" title={currentUser?.name || 'Manager'}>
              {currentUser?.name ? currentUser.name.charAt(0) : 'M'}
            </div>

            <div className="hidden 2xl:block min-w-0">
              <div className="text-xs font-bold text-slate-100 leading-tight truncate max-w-[110px]">
                {currentUser?.name || 'Muhammed Ibrahim'}
              </div>
              <div className="text-[10px] text-amber-400 font-medium truncate">
                {currentUser?.role || 'Manager'}
              </div>
            </div>

            <button
              onClick={logoutAdmin}
              title="Logout Admin"
              className="hidden 2xl:flex bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold p-2 rounded-xl items-center gap-1 transition-all flex-shrink-0 h-9"
            >
              <IconLogOut size={14} />
            </button>
          </div>

          {/* More (⋮) Menu Button for Tablet & Mobile (< 1024px) */}
          <button
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 hover:text-amber-300 transition-colors h-9 w-9 flex items-center justify-center flex-shrink-0"
            title="More Actions"
          >
            {isMoreMenuOpen ? <IconX size={16} /> : <IconMoreVertical size={18} />}
          </button>
        </div>
      </div>

      {/* Tablet & Mobile More (⋮) Dropdown Action Menu (< 1024px) */}
      {isMoreMenuOpen && (
        <div className="lg:hidden mt-2 p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 shadow-2xl animate-fade-in">
          {/* Mobile Full Width Search Input */}
          <div className="flex sm:hidden items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs w-full mb-2">
            <IconSearch size={15} className="text-slate-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search rooms, guests..."
              className="bg-transparent border-none text-slate-200 focus:outline-none placeholder-slate-500 w-full text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => {
                onOpenNewBookingModal();
                setIsMoreMenuOpen(false);
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold p-2.5 rounded-xl flex items-center justify-center gap-2 min-h-[44px]"
            >
              <IconPlus size={15} />
              <span>New Reservation</span>
            </button>

            <button
              onClick={() => {
                setPortalMode(portalMode === 'admin' ? 'guest' : 'admin');
                setIsMoreMenuOpen(false);
              }}
              className="w-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-semibold p-2.5 rounded-xl flex items-center justify-center gap-2 min-h-[44px]"
            >
              <IconGlobe size={15} />
              <span>{portalMode === 'admin' ? 'Switch to Guest Portal' : 'Switch to Admin Console'}</span>
            </button>

            <button
              onClick={() => {
                onOpenAuditLogsModal();
                setIsMoreMenuOpen(false);
              }}
              className="w-full bg-slate-900 border border-slate-800 text-amber-400 font-semibold p-2.5 rounded-xl flex items-center justify-center gap-2 min-h-[44px]"
            >
              <span>Audit Logs</span>
            </button>

            <button
              onClick={() => {
                logoutAdmin();
                setIsMoreMenuOpen(false);
              }}
              className="w-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold p-2.5 rounded-xl flex items-center justify-center gap-2 min-h-[44px]"
            >
              <IconLogOut size={15} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
