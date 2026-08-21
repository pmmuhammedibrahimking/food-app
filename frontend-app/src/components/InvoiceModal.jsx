import React from 'react';
import { useHotel } from '../context/HotelContext';
import { IconX, IconCrown, IconPrinter, IconCheckCircle, IconBed, IconCalendar } from './Icons';

export const InvoiceModal = () => {
  const { selectedInvoice, setSelectedInvoice, addToast } = useHotel();

  if (!selectedInvoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    const bookingId = selectedInvoice.id || 'BK-9021';
    const downloadUrl = `http://localhost:5000/api/invoices/${bookingId}/pdf`;
    
    // Trigger direct browser download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `invoice-${bookingId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    if (addToast) addToast(`Generating official PDF Invoice folio for ${bookingId}...`, 'success');
  };

  const nightlyTotal = selectedInvoice.totalAmount || 1050;
  const resortTax = Math.round(nightlyTotal * 0.12);
  const cityTax = Math.round(nightlyTotal * 0.05);
  const totalTaxes = resortTax + cityTax;

  const vipDiscount = selectedInvoice.roomCategory?.includes('Penthouse') || selectedInvoice.roomCategory?.includes('Villa') ? Math.round(nightlyTotal * 0.10) : 50;
  const promoDiscount = 50;
  const totalDiscounts = vipDiscount + promoDiscount;

  const grandTotal = nightlyTotal + totalTaxes - totalDiscounts;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) setSelectedInvoice(null);
      }}
    >
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden text-slate-100 space-y-4 max-h-[92vh] flex flex-col animate-scale-up">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20 flex-shrink-0">
              <IconCrown size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">
                  Tax Folio & Billing Invoice #{selectedInvoice.id}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Paid in Full
                </span>
              </div>
              <p className="text-xs text-slate-400">Official Aurelia Resort International VAT & Service Breakdown</p>
            </div>
          </div>

          <button
            onClick={() => setSelectedInvoice(null)}
            className="text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 text-xs overflow-y-auto flex-1 pr-4" id="printable-invoice">
          {/* Header Banner Info */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <h1 className="text-xl font-bold text-amber-400 font-serif tracking-wide mb-1">
                AURELIA RESORT & SPA
              </h1>
              <p className="text-slate-400">100 Oceanfront Promenade, Beverly Hills, CA</p>
              <p className="text-slate-400">Concierge Desk: +1 (800) 555-AURELIA • VAT: #TAX-8899201</p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Invoice Ref</span>
              <div className="font-bold text-amber-400 font-mono">INV-{selectedInvoice.id}</div>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block pt-1">Payment Status</span>
              <div className="font-extrabold text-emerald-400 flex items-center sm:justify-end gap-1">
                <IconCheckCircle size={14} /> {selectedInvoice.paymentStatus || 'PAID IN FULL'}
              </div>
            </div>
          </div>

          {/* Guest & Stay Details Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Guest Information</span>
              <div className="font-bold text-sm text-slate-100">{selectedInvoice.guestName}</div>
              <div className="text-slate-400 font-mono">{selectedInvoice.guestEmail}</div>
              <div className="text-slate-400 font-mono">{selectedInvoice.guestPhone || '+1 (555) 786-0199'}</div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Reservation Summary</span>
              <div className="font-bold text-sm text-slate-100">Room {selectedInvoice.roomNumber} ({selectedInvoice.roomCategory})</div>
              <div className="text-slate-400">Check-in: {selectedInvoice.checkIn}</div>
              <div className="text-slate-400">Check-out: {selectedInvoice.checkOut} ({selectedInvoice.totalNights} Nights)</div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300">Itemized Accommodations & Services</div>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Rate</th>
                    <th className="py-2.5 px-3">Qty</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                  <tr>
                    <td className="py-3 px-3 font-semibold text-slate-200">
                      Accommodation: Room {selectedInvoice.roomNumber} ({selectedInvoice.roomCategory})
                    </td>
                    <td className="py-3 px-3">${Math.round(nightlyTotal / (selectedInvoice.totalNights || 1))}</td>
                    <td className="py-3 px-3">{selectedInvoice.totalNights} Nights</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-100">${nightlyTotal.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-semibold text-slate-200">
                      Artisanal Truffle Omelette & Dom Pérignon (Room Service)
                    </td>
                    <td className="py-3 px-3">$150</td>
                    <td className="py-3 px-3">1 Service</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-100">$150</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Taxes & Discounts Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Taxes (+) */}
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                <span>Taxes Breakdown (+)</span>
                <span className="text-blue-400">+${totalTaxes.toLocaleString()}</span>
              </div>
              <div className="space-y-1 text-[11px] text-slate-400">
                <div className="flex justify-between">
                  <span>Resort Occupancy Tax (12%)</span>
                  <span className="text-slate-200">+${resortTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>City Luxury Tourism Tax (5%)</span>
                  <span className="text-slate-200">+${cityTax.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Discounts (-) */}
            <div className="bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                <span>Discounts & Promos (-)</span>
                <span className="text-amber-400">-${totalDiscounts.toLocaleString()}</span>
              </div>
              <div className="space-y-1 text-[11px] text-amber-200/80">
                <div className="flex justify-between">
                  <span>VIP Tier Membership Discount</span>
                  <span className="font-semibold">-${vipDiscount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Early Concierge Promo</span>
                  <span className="font-semibold">-${promoDiscount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grand Totals Summary Box */}
          <div className="flex justify-end pt-2">
            <div className="w-full sm:w-72 bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between text-slate-400 text-xs">
                <span>Subtotal:</span>
                <span className="text-slate-200">${(nightlyTotal + 150).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-xs">
                <span>Total Taxes (+):</span>
                <span className="text-blue-400">+${totalTaxes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-xs">
                <span>Total Discounts (-):</span>
                <span className="text-amber-400">-${totalDiscounts.toLocaleString()}</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between font-extrabold text-sm text-amber-400">
                <span>Grand Total:</span>
                <span>${grandTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-extrabold text-xs text-emerald-400 pt-1">
                <span>Total Paid:</span>
                <span>${grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer with Download PDF Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-t border-slate-800 bg-slate-950/80">
          <button
            onClick={handleDownloadPdf}
            className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
          >
            <span>📥</span>
            <span>Download Official PDF Folio</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
            >
              <IconPrinter size={15} /> Print Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
