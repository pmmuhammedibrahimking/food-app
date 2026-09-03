import React from 'react';
import { printPDFReport } from '../utils/reportExporter';
import { IconX, IconCheckCircle, IconPrinter, IconCrown, IconBed, IconCalendar } from './Icons';

export const GmailConfirmationModal = ({ isOpen, onClose, booking }) => {
  if (!isOpen || !booking) return null;

  const handlePrintPDF = () => {
    printPDFReport(
      `Official Confirmation Receipt - ${booking.id}`,
      [
        { label: 'Booking ID', value: booking.id },
        { label: 'Guest Name', value: booking.guestName },
        { label: 'Room', value: `${booking.roomNumber} (${booking.roomCategory || 'Suite'})` },
        { label: 'Total Paid', value: `$${booking.totalAmount}` }
      ],
      [
        {
          Field: 'Guest Email',
          Detail: booking.guestEmail
        },
        {
          Field: 'Check-In Date',
          Detail: booking.checkIn
        },
        {
          Field: 'Check-Out Date',
          Detail: booking.checkOut
        },
        {
          Field: 'Duration',
          Detail: `${booking.totalNights || 3} Nights`
        },
        {
          Field: 'Payment Status',
          Detail: booking.paymentStatus || 'Paid'
        }
      ]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh] animate-scale-up">
        {/* Fake Gmail Top Action Bar */}
        <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 font-extrabold text-xs px-2.5 py-1 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              Gmail Received
            </div>
            <span className="text-xs text-slate-400 font-mono truncate hidden sm:inline">
              inbox / reservations@aureliagrand.com
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintPDF}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
            >
              <IconPrinter size={14} /> Print PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <IconX size={18} />
            </button>
          </div>
        </div>

        {/* Email Header Info */}
        <div className="p-5 bg-slate-950/60 border-b border-slate-800/80 space-y-2 text-xs">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
              <span>Booking Confirmed! Reservation #{booking.id}</span>
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400 text-[11px]">
            <div>
              <strong className="text-slate-200">From (Hotel):</strong> Aurelia Grand Resort & Spa &lt;pmmuhammedibrahim786@gmail.com&gt;
            </div>
            <div>
              <strong className="text-slate-200">To (Customer):</strong> {booking.guestEmail || 'pmmuhammedibrahim786@gmail.com'}
            </div>
          </div>
        </div>

        {/* Styled HTML Email Content */}
        <div className="p-6 overflow-y-auto space-y-6 bg-slate-950/30">
          {/* Resort Header Card */}
          <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/10 border border-amber-500/30 rounded-2xl p-5 text-center space-y-2">
            <div className="inline-flex p-2.5 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 mb-1">
              <IconCrown size={28} />
            </div>
            <h3 className="font-serif text-lg font-bold text-slate-100 tracking-wide">
              AURELIA GRAND RESORT & SPA
            </h3>
            <p className="text-xs text-amber-400 font-medium uppercase tracking-widest">
              Official Reservation Confirmation
            </p>
          </div>

          {/* Salutation */}
          <div className="space-y-1.5 text-xs text-slate-300">
            <p className="font-bold text-sm text-slate-100">Dear {booking.guestName},</p>
            <p className="leading-relaxed">
              We are delighted to confirm your upcoming luxury stay at Aurelia Grand Resort & Spa. Below are your confirmed reservation details and room assignment.
            </p>
          </div>

          {/* Booking Summary Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                Reservation Reference
              </span>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-bold px-2.5 py-0.5 rounded-full text-[11px] flex items-center gap-1">
                <IconCheckCircle size={12} /> CONFIRMED & PAID
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 text-[10px] block font-bold uppercase">Suite / Room</span>
                <span className="font-bold text-slate-100 flex items-center gap-1.5 mt-0.5">
                  <IconBed size={14} className="text-amber-400" />
                  Room {booking.roomNumber} ({booking.roomCategory || 'Suite'})
                </span>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] block font-bold uppercase">Total Nights</span>
                <span className="font-bold text-slate-100 flex items-center gap-1.5 mt-0.5">
                  <IconCalendar size={14} className="text-amber-400" />
                  {booking.totalNights || 3} Nights
                </span>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] block font-bold uppercase">Check-In Date</span>
                <span className="font-semibold text-slate-200">{booking.checkIn}</span>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] block font-bold uppercase">Check-Out Date</span>
                <span className="font-semibold text-slate-200">{booking.checkOut}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold">Total Amount Charged:</span>
              <span className="text-base font-extrabold text-amber-400">${booking.totalAmount}</span>
            </div>
          </div>

          {/* Complimentary Perks Banner */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Included Luxury Inclusions
            </h4>
            <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
              <li>Complimentary Moët & Chandon Welcome Champagne</li>
              <li>24/7 Personal Butler Concierge Service</li>
              <li>Access to Michelin Spa & Oceanfront Infinity Pool</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-400 text-[11px]">
            Delivered to Customer: <strong className="text-amber-400">{booking.guestEmail || 'pmmuhammedibrahim786@gmail.com'}</strong>
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(booking.guestEmail || 'pmmuhammedibrahim786@gmail.com')}&su=${encodeURIComponent(`Booking Confirmed! Reservation #${booking.id} - Aurelia Resort`)}&body=${encodeURIComponent(`Dear ${booking.guestName},\n\nYour reservation at Aurelia Grand Resort & Spa is CONFIRMED!\n\n• Booking ID: ${booking.id}\n• Room: Room ${booking.roomNumber} (${booking.roomCategory || 'Suite'})\n• Check-In: ${booking.checkIn}\n• Check-Out: ${booking.checkOut}\n• Total Bill: $${booking.totalAmount}\n• Payment Status: ${booking.paymentStatus || 'Paid'}\n\nLuxury Inclusions:\n• Complimentary Moët & Chandon Welcome Champagne\n• 24/7 Personal Butler Concierge Service\n• Access to Michelin Spa\n\nWarm regards,\nAurelia Grand Resort & Spa Team`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md text-xs text-decoration-none"
            >
              <span>📧 Send Real Email via Gmail</span>
            </a>

            <button
              onClick={onClose}
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold px-4 py-2 rounded-xl transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
