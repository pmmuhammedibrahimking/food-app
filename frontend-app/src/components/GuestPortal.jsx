import React from 'react';
import { CustomerPortal } from './customer/CustomerPortal';

export const GuestPortal = ({ onOpenBookingModalWithRoom }) => {
  return <CustomerPortal onOpenBookingModalWithRoom={onOpenBookingModalWithRoom} />;
};

export default GuestPortal;
