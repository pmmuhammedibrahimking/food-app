import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { useTranslation } from '../i18n/I18nContext';
import {
  IconDashboard,
  IconBed,
  IconCalendar,
  IconUsers,
  IconSparkles,
  IconCrown,
  IconRefresh,
  IconGlobe,
  IconUtensils,
  IconTrendingUp,
  IconX,
  IconChevronLeft,
  IconChevronRight,
  IconLogOut
} from './Icons';

export const Sidebar = ({ isOpen, onClose }) => {
  const {
    activeTab,
    setActiveTab,
    portalMode,
    setPortalMode,
    rooms = [],
    bookings = [],
    housekeeping = [],
    diningOrders = [],
    currentUser,
    userRole,
    logoutAdmin,
    resetAllData
  } = useHotel();
  const { t } = useTranslation();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const activeBookingsCount = bookings.filter((b) => b.status === 'Checked-In' || b.status === 'Confirmed').length;
  const pendingCleaningCount = housekeeping.filter((h) => h.status !== 'Completed').length;
  const pendingOrdersCount = diningOrders.filter((o) => o.status !== 'Delivered').length;

  const effectiveRole = (currentUser?.role || userRole || 'Admin').toLowerCase();
  const isAdmin = effectiveRole === 'admin' || effectiveRole === 'general manager';

  // Role-Based Authorized Navigation Items Pool
  const getNavItemsForRole = () => {
    const allItems = {
      dashboard: { id: 'dashboard', label: t('dashboard') || 'Dashboard', icon: IconDashboard, category: 'Operations' },
      analytics: { id: 'analytics', label: t('analytics') || 'Analytics', icon: IconSparkles, category: 'Operations' },
      calendar: { id: 'calendar', label: t('calendar') || 'Calendar', icon: IconCalendar, category: 'Operations' },
      rooms: {
        id: 'rooms',
        label: t('rooms') || 'Rooms',
        icon: IconBed,
        badge: `${rooms.filter((r) => r.status === 'Available').length} free`,
        category: 'Operations'
      },
      bookings: {
        id: 'bookings',
        label: t('bookings') || 'Bookings',
        icon: IconCalendar,
        badge: activeBookingsCount > 0 ? activeBookingsCount : null,
        category: 'Operations'
      },
      guests: { id: 'guests', label: t('guests') || 'Guest Ledger', icon: IconUsers, category: 'Operations' },
      housekeeping: {
        id: 'housekeeping',
        label: t('housekeeping') || 'Housekeeping',
        icon: IconSparkles,
        badge: pendingCleaningCount > 0 ? pendingCleaningCount : null,
        category: 'Operations'
      },
      kitchen: {
        id: 'kitchen',
        label: 'Kitchen Display',
        icon: IconUtensils,
        category: 'Services'
      },
      dining: {
        id: 'dining',
        label: 'Room Service',
        icon: IconUtensils,
        badge: pendingOrdersCount > 0 ? pendingOrdersCount : null,
        category: 'Services'
      },
      staff: {
        id: 'staff',
        label: 'Staff Management',
        icon: IconUsers,
        category: 'Administration'
      },
      reports: {
        id: 'reports',
        label: t('reports') || 'Financial Reports',
        icon: IconTrendingUp,
        category: 'Administration'
      },
      guestportal: {
        id: 'guestportal',
        label: 'Customer Storefront',
        icon: IconGlobe,
        category: 'Portals'
      }
    };

    let allowedIds = [];
    if (isAdmin) {
      allowedIds = [
        'dashboard',
        'analytics',
        'calendar',
        'rooms',
        'bookings',
        'guests',
        'housekeeping',
        'kitchen',
        'dining',
        'staff',
        'reports',
        'guestportal'
      ];
    } else if (effectiveRole === 'manager') {
      allowedIds = [
        'dashboard',
        'calendar',
        'rooms',
        'bookings',
        'guests',
        'housekeeping',
        'kitchen',
        'dining',
        'reports',
        'guestportal'
      ];
    } else if (effectiveRole === 'receptionist') {
      allowedIds = ['dashboard', 'bookings', 'guests', 'rooms', 'dining', 'calendar', 'guestportal'];
    } else if (effectiveRole === 'housekeeping') {
      allowedIds = ['housekeeping', 'rooms', 'guestportal'];
    } else {
      // General Staff
      allowedIds = ['dashboard', 'calendar', 'rooms', 'bookings', 'guests', 'housekeeping', 'kitchen', 'dining', 'guestportal'];
    }

    return allowedIds.map((id) => allItems[id]).filter(Boolean);
  };

  const navItems = getNavItemsForRole();

  const handleNavClick = (tabId) => {
    if (tabId === 'guestportal') {
      setPortalMode('guest');
    } else {
      if (portalMode === 'guest') {
        setPortalMode('admin');
      }
      setActiveTab(tabId);
    }
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'w-20' : 'w-64'} p-4`}
      >
        {/* Sidebar Header: Brand & Collapse Toggle */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 flex-shrink-0">
              <IconCrown size={20} />
            </div>
            {(!isCollapsed || isOpen) && (
              <div className="min-w-0 animate-fade-in">
                <div className="font-serif text-sm font-bold tracking-wider text-slate-100 uppercase truncate">
                  AURELIA
                </div>
                <div className="text-[10px] text-amber-400 font-mono tracking-widest uppercase flex items-center gap-1 truncate">
                  <span>{isAdmin ? 'ADMIN CONSOLE' : 'STAFF CONSOLE'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-800 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <IconChevronRight size={16} /> : <IconChevronLeft size={16} />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Logged In Admin / Staff Profile Badge */}
        {(!isCollapsed || isOpen) && (
          <div className="mt-3 p-3 bg-slate-950/60 border border-amber-500/20 rounded-2xl flex items-center gap-3 animate-fade-in">
            <div className="relative flex-shrink-0">
              <img
                src={currentUser?.avatar || 'data:image/svg+xml;utf8,<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><circle cx="64" cy="64" r="64" fill="%23E2E8F0"/><circle cx="64" cy="46" r="22" fill="%23718096"/><path d="M22 108C22 84.804 40.804 66 64 66C87.196 66 106 84.804 106 108V114C106 114 90 124 64 124C38 124 22 114 22 114V108Z" fill="%23718096"/></svg>'}
                alt={currentUser?.name || 'Admin'}
                className="w-9 h-9 rounded-full object-cover border border-amber-400 shadow-sm"
              />
              <span className="absolute -bottom-1 -right-1 p-0.5 bg-slate-950 border border-amber-400 rounded-full text-amber-400">
                <IconCrown size={8} />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-100 truncate">{currentUser?.name || 'Administrator'}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase">
                  {currentUser?.role || (isAdmin ? 'Admin' : 'Staff')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto py-4 pr-1 space-y-1 custom-scrollbar">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id && portalMode !== 'guest';

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-400/20'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon
                    size={18}
                    className={`flex-shrink-0 ${
                      isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400 transition-colors'
                    }`}
                  />
                  {(!isCollapsed || isOpen) && (
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  )}
                  {(!isCollapsed || isOpen) && item.badge !== undefined && item.badge !== null && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-3 border-t border-slate-800/80 space-y-2">
          {!isCollapsed ? (
            <button
              onClick={logoutAdmin}
              className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold py-2.5 px-3 rounded-xl border border-rose-500/30 transition-all"
            >
              <IconLogOut size={14} />
              <span>Sign Out of Console</span>
            </button>
          ) : (
            <button
              onClick={logoutAdmin}
              title="Sign Out"
              className="w-full flex items-center justify-center p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30 transition-all"
            >
              <IconLogOut size={16} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
