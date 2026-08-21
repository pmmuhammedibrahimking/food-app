import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { exportToCSV, printPDFReport } from '../utils/reportExporter';
import { ConfirmModal } from './ConfirmModal';
import { EmptyState } from './EmptyState';
import { IconPlus, IconPrinter, IconX, IconSearch, IconCalendar, IconFilter, IconCrown } from './Icons';

export const BookingManagement = ({ onOpenNewBookingModal }) => {
  const { bookings, guests = [], checkInGuest, checkOutGuest, cancelBooking, deleteBooking, setSelectedInvoice, sendGmailConfirmation } = useHotel();

  // Filter States
  const [filterStatus, setFilterStatus] = useState('All');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
  const [vipOnlyFilter, setVipOnlyFilter] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    type: 'danger',
    onConfirm: null
  });

  const triggerCancelConfirm = (booking) => {
    setConfirmModal({
      isOpen: true,
      title: 'Cancel Reservation',
      message: `Are you sure you want to cancel reservation ${booking.id} for ${booking.guestName}? Room ${booking.roomNumber} will be freed.`,
      confirmText: 'Cancel Booking',
      type: 'warning',
      onConfirm: () => {
        cancelBooking(booking.id);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  const triggerDeleteConfirm = (booking) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Reservation',
      message: `Are you sure you want to PERMANENTLY DELETE reservation ${booking.id} for ${booking.guestName}? This cannot be undone.`,
      confirmText: 'Delete Reservation',
      type: 'danger',
      onConfirm: () => {
        deleteBooking(booking.id);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  const triggerCheckOutConfirm = (booking) => {
    setConfirmModal({
      isOpen: true,
      title: 'Check-Out Guest',
      message: `Complete check-out process for ${booking.guestName} (Room ${booking.roomNumber})? Room will be set to Cleaning status.`,
      confirmText: 'Check Out Guest',
      type: 'warning',
      onConfirm: () => {
        checkOutGuest(booking.id);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  const statuses = ['All', 'Confirmed', 'Checked-In', 'Checked-Out', 'Cancelled'];
  const paymentStatuses = ['All', 'Paid', 'Pending', 'Unpaid'];

  // Filtering Logic
  const filteredBookings = bookings.filter((b) => {
    // 1. Status Filter
    const statusMatch = filterStatus === 'All' || b.status === filterStatus;

    // 2. Payment Status Filter
    const paymentMatch = paymentStatusFilter === 'All' || (b.paymentStatus || 'Paid') === paymentStatusFilter;

    // 3. VIP Filter
    const guestObj = guests.find((g) => g.email.toLowerCase() === b.guestEmail.toLowerCase());
    const isVip = (guestObj && guestObj.vipStatus && guestObj.vipStatus !== 'Standard') || b.roomCategory === 'Penthouse' || b.roomCategory === 'Villa';
    const vipMatch = !vipOnlyFilter || isVip;

    // 4. Date Range Filter
    const checkInDate = b.checkIn;
    const startMatch = !startDate || checkInDate >= startDate;
    const endMatch = !endDate || checkInDate <= endDate;
    const dateMatch = startMatch && endMatch;

    // 5. Search Filter (Phone, Email, Name, ID, Room)
    const term = searchTerm.toLowerCase().trim();
    const searchMatch =
      !term ||
      b.guestName.toLowerCase().includes(term) ||
      b.guestEmail.toLowerCase().includes(term) ||
      (b.guestPhone && b.guestPhone.toLowerCase().includes(term)) ||
      b.id.toLowerCase().includes(term) ||
      b.roomNumber.includes(term);

    return statusMatch && paymentMatch && vipMatch && dateMatch && searchMatch;
  });

  const handleExportBookingsCSV = () => {
    exportToCSV(
      'Aurelia_Reservations_List',
      filteredBookings.map((b) => ({
        BookingID: b.id,
        GuestName: b.guestName,
        GuestEmail: b.guestEmail,
        RoomNumber: b.roomNumber,
        Category: b.roomCategory,
        CheckIn: b.checkIn,
        CheckOut: b.checkOut,
        TotalNights: b.totalNights,
        Status: b.status,
        PaymentStatus: b.paymentStatus || 'Paid',
        TotalAmount: `$${b.totalAmount}`
      }))
    );
  };

  const handlePrintBookingsPDF = () => {
    printPDFReport(
      'Reservations & Guest Stay Report',
      [{ label: 'Total Reservations Filtered', value: filteredBookings.length }],
      filteredBookings.map((b) => ({
        ID: b.id,
        Guest: b.guestName,
        Room: `${b.roomNumber} (${b.roomCategory})`,
        CheckIn: b.checkIn,
        CheckOut: b.checkOut,
        Status: b.status,
        Amount: `$${b.totalAmount}`
      }))
    );
  };

  // Pagination Logic
  const totalItems = filteredBookings.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + itemsPerPage);

  const handleResetFilters = () => {
    setFilterStatus('All');
    setPaymentStatusFilter('All');
    setVipOnlyFilter(false);
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Filter & Search Controls Panel */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {statuses.map((st) => (
              <button
                key={st}
                onClick={() => {
                  setFilterStatus(st);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterStatus === st
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto">
            <button
              onClick={handleExportBookingsCSV}
              className="bg-slate-950 hover:bg-slate-800 text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-800 text-slate-300 transition-all"
            >
              Export CSV
            </button>
            <button
              onClick={handlePrintBookingsPDF}
              className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold px-3 py-2.5 rounded-xl transition-all flex items-center gap-1"
            >
              <IconPrinter size={15} /> PDF Report
            </button>
            <button
              onClick={onOpenNewBookingModal}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
            >
              <IconPlus size={16} /> New Booking
            </button>
          </div>
        </div>

        {/* Detailed Filters & Search Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          {/* Search by Name, Email, Phone, ID */}
          <div className="lg:col-span-2 relative">
            <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search Name, Email, Phone, Room, ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-amber-500/50 placeholder-slate-500"
            />
          </div>

          {/* Payment Status Dropdown Filter */}
          <div>
            <select
              value={paymentStatusFilter}
              onChange={(e) => {
                setPaymentStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500/50"
            >
              {paymentStatuses.map((p) => (
                <option key={p} value={p} className="bg-slate-900 text-slate-200">
                  Payment: {p}
                </option>
              ))}
            </select>
          </div>

          {/* Check-In Start Date */}
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              title="From Date"
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Check-In End Date */}
          <div className="relative">
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              title="To Date"
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* VIP Filter Checkbox Toggle Button */}
          <div>
            <button
              type="button"
              onClick={() => {
                setVipOnlyFilter(!vipOnlyFilter);
                setCurrentPage(1);
              }}
              className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border ${
                vipOnlyFilter
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <IconCrown size={14} className={vipOnlyFilter ? 'text-amber-400' : 'text-slate-500'} />
              <span>{vipOnlyFilter ? 'VIP Guests Only' : 'VIP Guests'}</span>
            </button>
          </div>
        </div>

        {(searchTerm || startDate || endDate || paymentStatusFilter !== 'All' || vipOnlyFilter) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <span className="text-slate-400">Active Filters applied</span>
            <button onClick={handleResetFilters} className="text-amber-400 hover:text-amber-300 font-semibold underline">
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Bookings Data Table Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Reservations Engine</h2>
            <p className="text-xs text-slate-400">
              Showing {filteredBookings.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} reservations
            </p>
          </div>

          {/* Items Per Page Selector */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 px-2 py-1 rounded-lg focus:outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>

        {paginatedBookings.length === 0 ? (
          <EmptyState
            title="No Matching Reservations"
            message="No bookings match your current search terms, status filters, or date range."
            actionText="Reset All Filters"
            onAction={handleResetFilters}
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800 responsive-table-wrapper">
            <table className="w-full min-w-[780px] text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10.5px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3 sticky left-0 z-10 bg-slate-950">Booking ID</th>
                  <th className="py-3 px-3">Guest Name</th>
                  <th className="py-3 px-3">Contact Details</th>
                  <th className="py-3 px-3">Room & Tier</th>
                  <th className="py-3 px-3">Stay Dates</th>
                  <th className="py-3 px-3">Bill Total</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                {paginatedBookings.map((b) => {
                  const guestObj = guests.find((g) => g.email.toLowerCase() === b.guestEmail.toLowerCase());
                  const isVipGuest = (guestObj && guestObj.vipStatus && guestObj.vipStatus !== 'Standard') || b.roomCategory === 'Penthouse' || b.roomCategory === 'Villa';

                  return (
                    <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-amber-400 sticky left-0 z-10 bg-slate-900 flex items-center gap-1">
                        {b.id}
                        {isVipGuest && <IconCrown size={12} className="text-amber-400 inline" title="VIP Guest" />}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-100">{b.guestName}</td>
                      <td className="py-3 px-3 text-[11px] text-slate-300">
                        <div className="font-mono text-slate-200 truncate max-w-[150px]">{b.guestEmail}</div>
                        <div className="text-amber-400 font-mono text-[10px]">{b.guestPhone || 'N/A'}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-200">Room {b.roomNumber}</div>
                        <div className="text-[11px] text-slate-400">{b.roomCategory}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                        <div>{b.checkIn} → {b.checkOut}</div>
                        <div className="text-[10px] text-amber-400 font-semibold">{b.totalNights} Nights</div>
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-400">${(b?.totalAmount || 0).toLocaleString()}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${
                            b.paymentStatus === 'Paid'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : b.paymentStatus === 'Pending'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          ● {b.paymentStatus || 'Paid'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold ${
                            b.status === 'Checked-In'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : b.status === 'Confirmed'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : b.status === 'Checked-Out'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Check-In Primary Action (Green) */}
                          {b.status === 'Confirmed' && (
                            <button
                              onClick={() => checkInGuest(b.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1"
                            >
                              Check In
                            </button>
                          )}

                          {/* Check-Out Action (Red / Rose Danger with Confirm Modal) */}
                          {b.status === 'Checked-In' && (
                            <button
                              onClick={() => triggerCheckOutConfirm(b)}
                              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-all"
                            >
                              Check Out
                            </button>
                          )}

                          {/* Send Gmail Confirmation Action (Grey Secondary) */}
                          <button
                            onClick={() => sendGmailConfirmation(b)}
                            title="View / Send Gmail Booking Confirmation Email"
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-xs px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1"
                          >
                            Gmail
                          </button>

                          {/* Receipt Action (Grey Secondary) */}
                          <button
                            onClick={() => setSelectedInvoice(b)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs px-3 py-1.5 rounded-lg border border-slate-700 shadow-sm transition-all flex items-center gap-1"
                          >
                            <IconPrinter size={13} /> Receipt
                          </button>

                          {/* Cancel Action (Warning with Confirm Modal) */}
                          {b.status !== 'Cancelled' && b.status !== 'Checked-Out' && (
                            <button
                              onClick={() => triggerCancelConfirm(b)}
                              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-2.5 py-1.5 rounded-lg shadow-sm transition-all"
                              title="Cancel Reservation"
                            >
                              Cancel
                            </button>
                          )}

                          {/* Delete Action (Red Danger with Confirm Modal) */}
                          <button
                            onClick={() => triggerDeleteConfirm(b)}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-2.5 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1"
                            title="Delete Reservation Permanently"
                          >
                            <IconX size={13} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800 text-xs">
            <div className="text-slate-400">
              Page <span className="font-bold text-slate-100">{safePage}</span> of <span className="font-bold text-slate-100">{totalPages}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={safePage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-all font-medium"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-xl font-bold transition-all text-xs ${
                    safePage === pageNum
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                disabled={safePage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-all font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
