import React, { useState } from 'react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useHotel } from '../../context/HotelContext';
import { useTranslation } from '../../i18n/I18nContext';
import {
  IconCrown,
  IconGlobe,
  IconMenu,
  IconX,
  IconHeart,
  IconLogOut,
  IconCalendar,
  IconUserCheck,
  IconSettings,
  IconBell
} from '../Icons';

export const CustomerNavbar = () => {
  const {
    isCustomerAuthenticated,
    currentCustomer,
    customerLogout,
    openCustomerAuthModal,
    activeCustomerPage,
    setActiveCustomerPage,
    unreadNotificationsCount
  } = useCustomerAuth();

  const { setPortalMode } = useHotel();
  const { language, setLanguage, t } = useTranslation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleNavClick = (pageId) => {
    setActiveCustomerPage(pageId);
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'rooms', label: 'Suites & Villas' },
    { id: 'about', label: 'About Resort' },
    { id: 'contact', label: 'Contact & Concierge' }
  ];

  return (
    <nav className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-amber-500/20 px-4 sm:px-6 lg:px-12 py-3.5 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand & Resort Title */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 group text-left focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/25 flex-shrink-0 transition-transform group-hover:scale-105 duration-300">
            <IconCrown size={22} />
          </div>
          <div>
            <div className="font-serif text-base sm:text-xl font-bold tracking-wider text-slate-100 group-hover:text-amber-400 transition-colors">
              AURELIA RESORT
            </div>
            <div className="text-[10px] text-amber-400/90 font-semibold tracking-widest uppercase hidden sm:block">
              5★ Luxury Oceanfront Sanctuary
            </div>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800/80 backdrop-blur-md">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeCustomerPage === link.id
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-400/20'
                  : 'text-slate-300 hover:text-amber-300 hover:bg-slate-800/60'
              }`}
            >
              {link.label}
            </button>
          ))}

          {isCustomerAuthenticated && (
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                activeCustomerPage === 'dashboard'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-400/20'
                  : 'text-amber-400 hover:text-amber-300 hover:bg-slate-800/60'
              }`}
            >
              <span>Customer Dashboard</span>
              {unreadNotificationsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>
          )}
        </div>

        {/* Right Actions & Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
            <IconGlobe size={14} className="text-amber-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent border-none text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer pr-1"
            >
              <option value="en" className="bg-slate-900 text-white">EN</option>
              <option value="hi" className="bg-slate-900 text-white">हिंदी</option>
            </select>
          </div>

          {/* Switch to Staff Portal */}
          <button
            onClick={() => setPortalMode('admin')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-colors"
            title="Switch to Staff Operations Portal"
          >
            <span>Staff Portal</span>
          </button>

          {/* Customer Auth Button or User Menu */}
          {isCustomerAuthenticated && currentCustomer ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-amber-600/10 hover:from-amber-500/20 hover:to-amber-600/20 border border-amber-500/30 px-3 py-1.5 rounded-xl transition-all"
              >
                <img
                  src={currentCustomer.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                  alt={currentCustomer.name}
                  className="w-7 h-7 rounded-full object-cover border border-amber-400 flex-shrink-0"
                />
                <div className="text-left hidden sm:block max-w-[120px]">
                  <div className="text-xs font-bold text-slate-100 truncate">{currentCustomer.name}</div>
                  <div className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                    {currentCustomer.vipStatus || 'VIP'} Member
                  </div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-2xl border border-amber-500/30 rounded-2xl p-2 shadow-2xl space-y-1 text-xs text-slate-200 z-50 animate-scale-up">
                  <div className="p-3 border-b border-slate-800 bg-slate-950/60 rounded-xl mb-1">
                    <div className="font-bold text-slate-100">{currentCustomer.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{currentCustomer.email}</div>
                    <span className="inline-block mt-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase">
                      {currentCustomer.vipStatus || 'Standard'} Tier
                    </span>
                  </div>

                  <button
                    onClick={() => handleNavClick('dashboard')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors font-semibold"
                  >
                    <IconUserCheck size={16} className="text-amber-400" />
                    <span>Customer Dashboard</span>
                  </button>

                  <button
                    onClick={() => {
                      handleNavClick('dashboard');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors font-semibold"
                  >
                    <IconCalendar size={16} className="text-amber-400" />
                    <span>My Bookings</span>
                  </button>

                  <button
                    onClick={() => {
                      handleNavClick('rooms');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors font-semibold"
                  >
                    <IconHeart size={16} className="text-rose-400" />
                    <span>Saved Favorites</span>
                  </button>

                  <div className="border-t border-slate-800 pt-1">
                    <button
                      onClick={() => {
                        customerLogout();
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors font-semibold"
                    >
                      <IconLogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openCustomerAuthModal('login')}
                className="hidden sm:inline-flex px-3.5 py-2 text-xs font-bold text-slate-200 hover:text-amber-400 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => openCustomerAuthModal('register')}
                className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 text-xs font-extrabold px-4 py-2 rounded-xl shadow-lg shadow-amber-500/25 transition-all transform active:scale-95 whitespace-nowrap flex items-center gap-1.5"
              >
                <IconCrown size={15} />
                <span>Sign Up</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 hover:text-amber-300 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <IconX size={20} /> : <IconMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-slate-800 space-y-2 animate-fade-in">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`p-2.5 text-xs font-bold rounded-xl text-center transition-all ${
                  activeCustomerPage === link.id
                    ? 'bg-amber-400 text-slate-950 font-extrabold'
                    : 'bg-slate-900 text-slate-300 border border-slate-800'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {isCustomerAuthenticated ? (
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <button
                onClick={() => handleNavClick('dashboard')}
                className="w-full py-2.5 bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl text-center shadow-md"
              >
                Go to Customer Dashboard
              </button>
              <button
                onClick={() => {
                  customerLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2 bg-slate-900 text-rose-400 text-xs font-bold rounded-xl border border-slate-800"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-800 flex gap-2">
              <button
                onClick={() => {
                  openCustomerAuthModal('login');
                  setIsMobileMenuOpen(false);
                }}
                className="flex-1 py-2.5 bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold rounded-xl"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  openCustomerAuthModal('register');
                  setIsMobileMenuOpen(false);
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-extrabold rounded-xl shadow-md"
              >
                Sign Up
              </button>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={() => {
                setPortalMode('admin');
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold rounded-xl text-center"
            >
              Switch to Staff Operations Portal
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
