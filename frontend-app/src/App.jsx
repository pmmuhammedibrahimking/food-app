import React, { useState } from 'react';
import { HotelProvider, useHotel } from './context/HotelContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { BookingCalendar } from './components/BookingCalendar';
import { RoomManagement } from './components/RoomManagement';
import { BookingManagement } from './components/BookingManagement';
import { GuestManagement } from './components/GuestManagement';
import { Housekeeping } from './components/Housekeeping';
import { KitchenDisplay } from './components/KitchenDisplay';
import { DiningMenu } from './components/DiningMenu';
import { StaffManagement } from './components/StaffManagement';
import { ReportsModule } from './components/ReportsModule';
import { GuestPortal } from './components/GuestPortal';
import { AdminLogin } from './components/AdminLogin';
import { NewBookingModal } from './components/NewBookingModal';
import { InvoiceModal } from './components/InvoiceModal';
import { Toast } from './components/Toast';
import { AuditLogsModal } from './components/AuditLogsModal';
import { I18nProvider } from './i18n/I18nContext';
import './index.css';
import './App.css';

import { CustomerAuthProvider } from './context/CustomerAuthContext';
import { GmailConfirmationModal } from './components/GmailConfirmationModal';
import { IconShieldCheck, IconLock } from './components/Icons';

function MainAppContent() {
  const {
    activeTab,
    setActiveTab,
    portalMode,
    isAuthenticated,
    currentUser,
    userRole,
    gmailConfirmationBooking,
    setGmailConfirmationBooking
  } = useHotel();

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [modalDefaultRoom, setModalDefaultRoom] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAuditLogsModalOpen, setIsAuditLogsModalOpen] = useState(false);

  const handleOpenBookingModal = (room = null) => {
    setModalDefaultRoom(room);
    setIsBookingModalOpen(true);
  };

  const effectiveRole = (currentUser?.role || userRole || 'Guest').toLowerCase();
  const isAdmin = effectiveRole === 'admin' || effectiveRole === 'general manager';

  // 1. Guest / Customer Portal
  if (portalMode === 'guest') {
    return (
      <>
        <GuestPortal onOpenBookingModalWithRoom={handleOpenBookingModal} />
        <NewBookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          defaultRoom={modalDefaultRoom}
        />
        <InvoiceModal />
        <GmailConfirmationModal
          isOpen={!!gmailConfirmationBooking}
          booking={gmailConfirmationBooking}
          onClose={() => setGmailConfirmationBooking(null)}
        />
        <Toast />
      </>
    );
  }

  // 2. Admin / Staff Portal Authentication Check
  if (!isAuthenticated) {
    return (
      <>
        <AdminLogin />
        <Toast />
      </>
    );
  }

  // 3. Authenticated Operations & Admin Console
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onOpenNewBookingModal={() => handleOpenBookingModal()}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onOpenAuditLogsModal={() => setIsAuditLogsModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 animate-fade-in">
          {activeTab === 'dashboard' && <Dashboard onOpenNewBookingModal={() => handleOpenBookingModal()} />}
          {activeTab === 'analytics' && (
            isAdmin ? <AnalyticsDashboard /> : (
              <div className="p-8 text-center bg-slate-900/80 border border-slate-800 rounded-3xl space-y-3">
                <IconLock size={32} className="mx-auto text-amber-400" />
                <h3 className="font-serif text-lg font-bold text-slate-100">Executive Analytics Restricted</h3>
                <p className="text-xs text-slate-400">This module is strictly restricted to Administrator accounts.</p>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="px-4 py-2 bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Return to Dashboard
                </button>
              </div>
            )
          )}
          {activeTab === 'calendar' && <BookingCalendar onOpenNewBookingModal={handleOpenBookingModal} />}
          {activeTab === 'rooms' && <RoomManagement />}
          {activeTab === 'bookings' && <BookingManagement onOpenNewBookingModal={() => handleOpenBookingModal()} />}
          {activeTab === 'guests' && <GuestManagement />}
          {activeTab === 'housekeeping' && <Housekeeping />}
          {activeTab === 'kitchen' && <KitchenDisplay />}
          {activeTab === 'dining' && <DiningMenu />}
          {activeTab === 'staff' && (
            isAdmin ? <StaffManagement /> : (
              <div className="p-8 text-center bg-slate-900/80 border border-slate-800 rounded-3xl space-y-3">
                <IconLock size={32} className="mx-auto text-amber-400" />
                <h3 className="font-serif text-lg font-bold text-slate-100">Staff Management Restricted</h3>
                <p className="text-xs text-slate-400">Only Administrator users can manage staff credentials and access tiers.</p>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="px-4 py-2 bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Return to Dashboard
                </button>
              </div>
            )
          )}
          {activeTab === 'reports' && (
            isAdmin || effectiveRole === 'manager' ? <ReportsModule /> : (
              <div className="p-8 text-center bg-slate-900/80 border border-slate-800 rounded-3xl space-y-3">
                <IconLock size={32} className="mx-auto text-amber-400" />
                <h3 className="font-serif text-lg font-bold text-slate-100">Financial Reports Restricted</h3>
                <p className="text-xs text-slate-400">Financial reporting requires Administrator or Manager clearance.</p>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="px-4 py-2 bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Return to Dashboard
                </button>
              </div>
            )
          )}
        </main>
      </div>

      <NewBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        defaultRoom={modalDefaultRoom}
      />
      <AuditLogsModal
        isOpen={isAuditLogsModalOpen}
        onClose={() => setIsAuditLogsModalOpen(false)}
      />
      <InvoiceModal />
      <GmailConfirmationModal
        isOpen={!!gmailConfirmationBooking}
        booking={gmailConfirmationBooking}
        onClose={() => setGmailConfirmationBooking(null)}
      />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <HotelProvider>
      <CustomerAuthProvider>
        <I18nProvider>
          <MainAppContent />
        </I18nProvider>
      </CustomerAuthProvider>
    </HotelProvider>
  );
}
