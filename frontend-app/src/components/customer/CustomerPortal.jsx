import React from 'react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { CustomerNavbar } from './CustomerNavbar';
import { CustomerHome } from './CustomerHome';
import { CustomerRooms } from './CustomerRooms';
import { CustomerAbout } from './CustomerAbout';
import { CustomerContact } from './CustomerContact';
import { CustomerDashboard } from './CustomerDashboard';
import { CustomerFooter } from './CustomerFooter';
import { CustomerAuthModal } from './CustomerAuthModal';
import { RoomDetailsModal } from './RoomDetailsModal';
import { AIChatbot } from '../AIChatbot';

export const CustomerPortal = ({ onOpenBookingModalWithRoom }) => {
  const { activeCustomerPage, isCustomerAuthenticated } = useCustomerAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950">
      {/* Top Luxury Navigation Header */}
      <CustomerNavbar />

      {/* Main Page Body Router */}
      <main className="flex-1">
        {activeCustomerPage === 'home' && (
          <CustomerHome onOpenBookingModalWithRoom={onOpenBookingModalWithRoom} />
        )}
        {activeCustomerPage === 'rooms' && (
          <CustomerRooms onOpenBookingModalWithRoom={onOpenBookingModalWithRoom} />
        )}
        {activeCustomerPage === 'about' && <CustomerAbout />}
        {activeCustomerPage === 'contact' && <CustomerContact />}
        {activeCustomerPage === 'dashboard' && (
          <CustomerDashboard onOpenBookingModalWithRoom={onOpenBookingModalWithRoom} />
        )}
      </main>

      {/* Luxury Footer */}
      <CustomerFooter />

      {/* Customer Authentication Modal (Sign In, Sign Up, Forgot, Reset) */}
      <CustomerAuthModal />

      {/* Room Details Modal */}
      <RoomDetailsModal onOpenBookingModalWithRoom={onOpenBookingModalWithRoom} />

      {/* 24/7 AI Concierge Bot */}
      <AIChatbot />
    </div>
  );
};
