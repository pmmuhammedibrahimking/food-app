import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import {
  IconPhone,
  IconMail,
  IconMapPin,
  IconSend,
  IconSparkles,
  IconShield,
  IconClock,
  IconCheckCircle
} from '../Icons';

export const CustomerContact = () => {
  const { addToast } = useHotel();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Suite Reservation Inquiry',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      addToast('Please fill all required fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      addToast(`✨ Concierge message sent! We will contact you at ${formData.email}.`, 'success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'Suite Reservation Inquiry',
        message: ''
      });
    }, 600);
  };

  const faqs = [
    {
      q: 'What are the check-in and check-out times?',
      a: 'Standard check-in begins at 3:00 PM and check-out is at 12:00 PM noon. Gold and Diamond VIP members receive complimentary guaranteed early 11:00 AM check-in and late 3:00 PM check-out privileges.'
    },
    {
      q: 'Are private helicopter transfers available?',
      a: 'Yes. Our private rooftop helipad accommodates executive twin-engine aircraft. Helipad transfers from LAX or private regional airports can be booked directly through our 24/7 Butler Concierge.'
    },
    {
      q: 'What is the resort cancellation policy?',
      a: 'Reservations can be modified or cancelled up to 48 hours prior to the scheduled arrival date with full refund. VIP members enjoy zero cancellation penalties up to 24 hours prior.'
    },
    {
      q: 'Are pets allowed at the resort?',
      a: 'We warmly welcome pampered companions under 25 lbs in our private Beachfront Villas and Suites. Luxury pet amenities including organic gourmet menus and bespoke pet bedding are provided.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16 animate-fade-in font-sans text-slate-200">
      {/* Header */}
      <section className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
          <IconSparkles size={14} />
          <span>24/7 BESPOKE CONCIERGE</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-slate-100 tracking-tight">
          Connect With Our Executive Concierge
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Whether arranging a private yacht charter, custom Michelin tasting, or helicopter transfer, our team is at your immediate service.
        </p>
      </section>

      {/* Grid: Contact Info & Form */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Direct Hotlines */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-slate-100">
              Direct Contact Lines
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                  <IconPhone size={18} />
                </div>
                <div>
                  <div className="font-bold text-slate-100">24/7 International Concierge</div>
                  <div className="font-mono text-slate-300 mt-0.5">+1 (800) 555-AURELIA</div>
                  <div className="font-mono text-slate-400 text-[11px]">+1 (310) 555-0199 (Direct)</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                  <IconMail size={18} />
                </div>
                <div>
                  <div className="font-bold text-slate-100">VIP Concierge & Bookings</div>
                  <div className="text-slate-300 mt-0.5">concierge@aureliagrandresort.com</div>
                  <div className="text-slate-400 text-[11px]">vip-desk@aurelia.com</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                  <IconMapPin size={18} />
                </div>
                <div>
                  <div className="font-bold text-slate-100">Resort Sanctuaries Location</div>
                  <div className="text-slate-300 mt-0.5">100 Oceanfront Promenade</div>
                  <div className="text-slate-400 text-[11px]">Beverly Hills Coastal Enclave, CA 90210</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500/15 via-slate-900 to-amber-600/10 border border-amber-500/30 p-6 rounded-3xl space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <IconSparkles size={16} />
              <span>Rapid Butler Dispatch</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              In-house guests can dial extension <span className="font-bold text-amber-400">#001</span> from suite phone or tap in-app digital concierge for instant assistance.
            </p>
          </div>
        </div>

        {/* Right 2 Columns: Contact Form */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          <div className="space-y-1 border-b border-slate-800 pb-4">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-100">
              Send a Bespoke Concierge Inquiry
            </h2>
            <p className="text-xs text-slate-400">
              Please share your preferred dates and special requirements. We reply within 60 minutes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lord Alexander Wright"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. alexander@royals.co.uk"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Phone Number (Optional)</label>
                <input
                  type="text"
                  placeholder="+1 (555) 019-9922"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Inquiry Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60"
                >
                  <option value="Suite Reservation Inquiry">Suite & Villa Reservation Inquiry</option>
                  <option value="Helicopter Transfer Booking">Private Helicopter & Chauffeur Transfer</option>
                  <option value="Private Event or Wedding">Private Oceanfront Event or Wedding</option>
                  <option value="Dietary & Chef Tasting Request">Custom Dietary / Chef Tasting Request</option>
                  <option value="General Concierge Assistance">General Concierge Assistance</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Message & Special Requests *</label>
              <textarea
                rows={4}
                required
                placeholder="Please describe your stay dates, guests, arrival details, or bespoke dining requests..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 p-3.5 rounded-xl focus:outline-none focus:border-amber-500/60"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-extrabold py-3.5 rounded-xl shadow-lg shadow-amber-500/25 transition-all transform active:scale-95 flex items-center justify-center gap-2"
            >
              <IconSend size={16} />
              <span>{isSubmitting ? 'Dispatching Message...' : 'Submit Inquiry to Executive Concierge'}</span>
            </button>
          </form>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6">
        <div className="text-center space-y-1 max-w-xl mx-auto">
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
            FREQUENT INQUIRIES
          </div>
          <h2 className="font-serif text-2xl font-bold text-slate-100">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-slate-200 hover:text-amber-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className="text-amber-400 text-sm ml-2">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 text-xs text-slate-400 leading-relaxed border-t border-slate-900">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
