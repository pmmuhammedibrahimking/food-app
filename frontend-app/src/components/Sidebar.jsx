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
  IconChevronRight
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
    resetAllData
  } = useHotel();
  const { t } = useTranslation();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const activeBookingsCount = bookings.filter(b => b.status === 'Checked-In' || b.status === 'Confirmed').length;
  const pendingCleaningCount = housekeeping.filter(h => h.status !== 'Completed').length;
  const pendingOrdersCount = diningOrders.filter(o => o.status !== 'Delivered').length;

  const currentRole = portalMode === 'guest' ? 'Guest' : (currentUser?.role || 'Admin');

  // Role-Based Authorized Navigation Items Pool
  const getNavItemsForRole = () => {
    const isGuestMode = portalMode === 'guest' || currentRole === 'Guest';

    const allItems = {
      dashboard: { id: 'dashboard', label: t('dashboard'), icon: IconDashboard, category: 'Operations' },
      analytics: { id: 'analytics', label: t('analytics'), icon: IconSparkles, category: 'Operations' },
      calendar: { id: 'calendar', label: t('calendar'), icon: IconCalendar, category: 'Operations' },
      rooms: {
        id: 'rooms',
        label: t('rooms'),
        icon: IconBed,
        badge: `${rooms.filter(r => r.status === 'Available').length} free`,
        category: 'Operations'
      },
      bookings: {
        id: 'bookings',
        label: isGuestMode ? 'My Bookings' : t('bookings'),
        icon: IconCalendar,
        badge: activeBookingsCount > 0 ? activeBookingsCount : null,
        category: 'Operations'
      },
      guests: { id: 'guests', label: t('guests'), icon: IconUsers, category: 'Operations' },
      housekeeping: {
        id: 'housekeeping',
        label: t('housekeeping'),
        icon: IconSparkles,
        badge: pendingCleaningCount > 0 ? pendingCleaningCount : null,
        category: 'Operations'
      },
      dining: {
        id: 'dining',
        label: 'Room Service',
        icon: IconUtensils,
        badge: pendingOrdersCount > 0 ? pendingOrdersCount : null,
        category: 'Services'
      },
      reports: { id: 'reports', label: t('reports') || 'Reports Engine', icon: IconTrendingUp, category: 'Operations' },
      guestportal: { id: 'guestportal', label: 'Guest Portal', icon: IconGlobe, category: 'Customer Portal' }
    };

    let allowedIds = [];
    switch (currentRole) {
      case 'Manager':
        allowedIds = ['dashboard', 'rooms', 'bookings', 'guests', 'analytics', 'calendar', 'reports'];
        break;
      case 'Receptionist':
        allowedIds = ['bookings', 'guests', 'rooms', 'dining'];
        break;
      case 'Housekeeping':
        allowedIds = ['housekeeping', 'rooms'];
        break;
      case 'Guest':
        allowedIds = ['guestportal', 'bookings', 'dining'];
        break;
      case 'Admin':
      default:
        allowedIds = ['dashboard', 'analytics', 'calendar', 'rooms', 'bookings', 'guests', 'housekeeping', 'dining', 'reports', 'guestportal'];
        break;
    }

    return allowedIds.map(id => allItems[id]).filter(Boolean);
  };

  const navItems = getNavItemsForRole();

  const handleNavClick = (tabId) => {
    if (tabId === 'guestportal') {
      setPortalMode('guest');
    } else {
      if (portalMode === 'guest' && tabId !== 'guestportal') {
        // Switch back to admin if choosing admin tab
        setPortalMode('admin');
      }
      setActiveTab(tabId);
    }
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Navigation Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-slate-900/95 border-r border-slate-800/80 backdrop-blur-md p-4 flex flex-col justify-between transform transition-all duration-300 ease-in-out lg:static lg:translate-x-0 lg:flex-shrink-0 ${
          isOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64 xl:w-72'}`}
      >
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-800/80 mb-6">
            <div className={`flex items-center ${isCollapsed ? 'lg:justify-center lg:w-full' : 'gap-3'}`}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20 flex-shrink-0">
                <IconCrown size={22} />
              </div>
              {(!isCollapsed || isOpen) && (
                <div className="min-w-0">
                  <div className="text-base font-extrabold tracking-wider text-amber-400 font-serif whitespace-nowrap">
                    AURELIA
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium tracking-wide whitespace-nowrap">
                    {currentRole} Console
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Collapse/Expand Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              className="hidden lg:flex items-center justify-center text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              {isCollapsed ? <IconChevronRight size={18} /> : <IconChevronLeft size={18} />}
            </button>

            {/* Mobile / Tablet Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-800"
            >
              <IconX size={20} />
            </button>
          </div>

          {/* Role Indicator Badge */}
          {(!isCollapsed || isOpen) && (
            <div className="mb-4 px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Role:</span>
              <span className="font-extrabold text-amber-400 uppercase tracking-wider text-[11px]">{currentRole}</span>
            </div>
          )}

          {/* Navigation Menu */}
          <nav className="space-y-4">
            <div>
              {(!isCollapsed || isOpen) && (
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 mb-2">
                  Navigation
                </div>
              )}

              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id || (item.id === 'guestportal' && portalMode === 'guest');

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      title={isCollapsed ? item.label : undefined}
                      className={`w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-amber-500/15 text-amber-400 font-semibold border-l-4 border-amber-400 shadow-sm shadow-amber-500/10 pl-2.5'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      } ${isCollapsed && !isOpen ? 'md:justify-center md:px-0' : ''}`}
                    >
                      <div className={`flex items-center ${isCollapsed && !isOpen ? 'md:justify-center' : 'gap-3'}`}>
                        <Icon size={18} className={isActive ? 'text-amber-400' : 'text-slate-400'} />
                        {(!isCollapsed || isOpen) && <span>{item.label}</span>}
                      </div>

                      {(!isCollapsed || isOpen) && item.badge !== undefined && item.badge !== null && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          {!isCollapsed ? (
            <button
              onClick={resetAllData}
              title="Reset Demo Data"
              className="w-full flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-slate-100 text-xs font-semibold py-2.5 px-3 rounded-xl border border-slate-700/60 transition-all"
            >
              <IconRefresh size={14} />
              <span>Reset Demo Data</span>
            </button>
          ) : (
            <button
              onClick={resetAllData}
              title="Reset Demo Data"
              className="w-full flex items-center justify-center p-2.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-700/60 transition-all"
            >
              <IconRefresh size={16} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
