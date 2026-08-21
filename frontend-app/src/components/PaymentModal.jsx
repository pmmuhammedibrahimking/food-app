import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { useTranslation } from '../i18n/I18nContext';
import { IconX, IconCheckCircle, IconDollarSign, IconCrown, IconSparkles } from './Icons';

export const PaymentModal = ({ isOpen, onClose, bookingData, onPaymentSuccess }) => {
  const { updateBookingPaymentStatus, addToast } = useHotel();
  const { t } = useTranslation();
  const [gateway, setGateway] = useState('stripe'); // 'stripe' | 'razorpay' | 'applepay'
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    cardName: bookingData?.guestName || 'Muhammed Ibrahim',
    cardNumber: '4242 •••• •••• 7860',
    cardExpiry: '08/29',
    cardCvc: '888',
    upiId: 'pmmuhammedibrahim@okaxis'
  });

  if (!isOpen || !bookingData) return null;

  const totalAmount = bookingData.totalAmount || bookingData.price || 1200;

  const handlePay = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);

      if (updateBookingPaymentStatus) {
        updateBookingPaymentStatus(bookingData.id, 'Paid');
      }

      if (onPaymentSuccess) {
        onPaymentSuccess({ ...bookingData, paymentStatus: 'Paid', gateway });
      }

      if (addToast) {
        addToast(`Payment of $${totalAmount.toLocaleString()} completed successfully!`, 'success');
      }

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1600);
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative bg-slate-900/95 border border-amber-500/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl space-y-0 text-slate-100 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
              <IconDollarSign size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {t('paymentTitle') || 'Luxury Checkout & Folio'}
              </h3>
              <p className="text-[11px] text-slate-400">256-Bit TLS End-to-End Encrypted Gateway</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Body */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-3 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <IconCheckCircle size={36} />
            </div>
            <h3 className="text-xl font-bold text-slate-100">Payment Authorized & Confirmed!</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Reservation folio <strong className="text-amber-400">#{bookingData.id || 'BK-7860'}</strong> has been officially marked as <span className="text-emerald-400 font-bold">PAID</span>. Digital receipt dispatched to email.
            </p>
          </div>
        ) : (
          <form onSubmit={handlePay} className="p-5 sm:p-6 space-y-4 text-xs">
            {/* Booking Summary Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Reservation Folio
                </div>
                <div className="text-xs font-bold text-slate-100 mt-0.5">
                  {bookingData.roomCategory || 'Penthouse Suite'} • Room {bookingData.roomNumber || '401'}
                </div>
                <div className="text-[11px] text-slate-400">Guest: {bookingData.guestName || 'Muhammed Ibrahim'}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Total Payable</div>
                <div className="text-lg font-extrabold text-emerald-400 font-mono">${totalAmount.toLocaleString()}</div>
              </div>
            </div>

            {/* Gateway Selector Tabs */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Select Luxury Payment Channel</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGateway('stripe')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    gateway === 'stripe'
                      ? 'bg-amber-400 text-slate-950 font-extrabold shadow-md shadow-amber-400/20 border-amber-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>💳 Card Authorization</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGateway('razorpay')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    gateway === 'razorpay'
                      ? 'bg-amber-400 text-slate-950 font-extrabold shadow-md shadow-amber-400/20 border-amber-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>⚡ Instant UPI / QR</span>
                </button>
              </div>
            </div>

            {/* Form Fields depending on Gateway */}
            {gateway === 'stripe' ? (
              <div className="space-y-3 bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                {/* Virtual Gold Credit Card Simulation */}
                <div className="bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-700 p-4 rounded-xl text-slate-950 shadow-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-950/80">AURELIA WORLD ELITE</span>
                    <span className="font-mono text-xs font-bold">VISA</span>
                  </div>
                  <div className="font-mono text-sm sm:text-base font-bold tracking-widest text-slate-950">
                    {formData.cardNumber}
                  </div>
                  <div className="flex justify-between items-end text-[10px]">
                    <div>
                      <div className="text-[8px] uppercase tracking-wider text-slate-950/70 font-bold">CARDHOLDER</div>
                      <div className="font-bold uppercase truncate max-w-[150px]">{formData.cardName}</div>
                    </div>
                    <div>
                      <div className="text-[8px] uppercase tracking-wider text-slate-950/70 font-bold">EXPIRES</div>
                      <div className="font-bold">{formData.cardExpiry}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Expiry Date</label>
                    <input
                      type="text"
                      value={formData.cardExpiry}
                      onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500/60 font-mono"
                      placeholder="MM/YY"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Security CVC</label>
                    <input
                      type="text"
                      value={formData.cardCvc}
                      onChange={(e) => setFormData({ ...formData, cardCvc: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500/60 font-mono"
                      placeholder="CVC"
                      required
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Virtual UPI VPA ID</label>
                  <input
                    type="text"
                    value={formData.upiId}
                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                    placeholder="name@upi"
                    required
                  />
                </div>
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/30 text-blue-300 text-[11px] text-center">
                  Scan Dynamic Hotel QR or authorize push notification on Google Pay / PhonePe
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-3 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="w-2/3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-extrabold py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                    <span>Processing Authorization...</span>
                  </>
                ) : (
                  <>
                    <IconCheckCircle size={15} />
                    <span>Authorize & Pay (${totalAmount.toLocaleString()})</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
