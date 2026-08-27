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
import { DiningMenu } from './components/DiningMenu';
import { ReportsModule } from './components/ReportsModule';
import { GuestPortal } from './components/GuestPortal';
import { AdminLogin } from './components/AdminLogin';
import { NewBookingModal } from './components/NewBookingModal';
import { InvoiceModal } from './components/InvoiceModal';
import { Toast } from './components/Toast';
import { AIChatbot } from './components/AIChatbot';
import { AuditLogsModal } from './components/AuditLogsModal';
import { I18nProvider } from './i18n/I18nContext';
import './index.css';
import './App.css';

import { CustomerAuthProvider } from './context/CustomerAuthContext';
import { GmailConfirmationModal } from './components/GmailConfirmationModal';
import { AuthModal } from './components/AuthModal';
import { GoogleAuthModal } from './components/GoogleAuthModal';

function MainAppContent() {
  const { activeTab, portalMode, isAuthenticated, gmailConfirmationBooking, setGmailConfirmationBooking } = useHotel();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [modalDefaultRoom, setModalDefaultRoom] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAuditLogsModalOpen, setIsAuditLogsModalOpen] = useState(false);

  const handleOpenBookingModal = (room = null) => {
    setModalDefaultRoom(room);
    setIsBookingModalOpen(true);
  };

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
        <AuthModal />
        <GoogleAuthModal />
        <Toast />
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <AdminLogin />
        <AuthModal />
        <GoogleAuthModal />
        <Toast />
      </>
    );
  }

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
          {activeTab === 'analytics' && <AnalyticsDashboard />}
          {activeTab === 'calendar' && <BookingCalendar onOpenNewBookingModal={handleOpenBookingModal} />}
          {activeTab === 'rooms' && <RoomManagement />}
          {activeTab === 'bookings' && <BookingManagement onOpenNewBookingModal={() => handleOpenBookingModal()} />}
          {activeTab === 'guests' && <GuestManagement />}
          {activeTab === 'housekeeping' && <Housekeeping />}
          {activeTab === 'dining' && <DiningMenu />}
          {activeTab === 'reports' && <ReportsModule />}
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
      <AuthModal />
      <GoogleAuthModal />
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
