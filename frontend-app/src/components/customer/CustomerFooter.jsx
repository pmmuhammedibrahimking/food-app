import React, { useState } from 'react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useHotel } from '../../context/HotelContext';
import { IconCrown, IconPhone, IconMail, IconMapPin, IconSend, IconShield, IconStar } from '../Icons';

export const CustomerFooter = () => {
  const { setActiveCustomerPage } = useCustomerAuth();
  const { addToast, setPortalMode } = useHotel();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      addToast('Please enter a valid email address.', 'error');
      return;
    }
    addToast(`✨ Thank you! VIP Concierge Gazette subscribed for ${newsletterEmail}`, 'success');
    setNewsletterEmail('');
  };

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-amber-500/20 pt-12 pb-8 px-4 sm:px-6 lg:px-12 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {/* Column 1: Brand & Heritage */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20 flex-shrink-0">
              <IconCrown size={22} />
            </div>
            <div>
              <div className="font-serif text-lg font-bold tracking-wider text-slate-100">
                AURELIA RESORT
              </div>
              <div className="text-[10px] text-amber-400 font-semibold tracking-widest uppercase">
                Grand Luxury & Coastal Spa
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Perched along pristine coastal bluffs, Aurelia Grand Resort offers bespoke butler services, private ocean sanctuaries, and world-class Michelin dining.
          </p>

          <div className="flex items-center gap-1.5 text-amber-400 text-xs">
            {[...Array(5)].map((_, i) => (
              <IconStar key={i} size={15} />
            ))}
            <span className="text-slate-300 font-bold text-[11px] ml-1">5-Star Forbes Luxury</span>
          </div>
        </div>

        {/* Column 2: Navigation Links */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100">
            Resort Sanctuaries
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button
                onClick={() => {
                  setActiveCustomerPage('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-amber-400 transition-colors"
              >
                Resort Overview & Amenities
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveCustomerPage('rooms');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-amber-400 transition-colors"
              >
                Oceanfront Suites & Beachfront Villas
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveCustomerPage('about');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-amber-400 transition-colors"
              >
                Our Heritage & Culinary Masters
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveCustomerPage('contact');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-amber-400 transition-colors"
              >
                VIP Concierge Inquiries & Location
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Concierge Contact */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100">
            Concierge & Location
          </h4>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-start gap-2.5">
              <IconMapPin size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <span>100 Oceanfront Promenade, Beverly Hills coastal enclave, CA 90210</span>
            </div>
            <div className="flex items-center gap-2.5">
              <IconPhone size={16} className="text-amber-400 flex-shrink-0" />
              <span className="font-mono text-slate-200">+1 (800) 555-AURELIA</span>
            </div>
            <div className="flex items-center gap-2.5">
              <IconMail size={16} className="text-amber-400 flex-shrink-0" />
              <span className="text-slate-200">concierge@aureliagrandresort.com</span>
            </div>
          </div>
        </div>

        {/* Column 4: VIP Newsletter */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100">
            Exclusive Concierge Gazette
          </h4>
          <p className="text-xs text-slate-400">
            Subscribe to receive private seasonal villa offerings and chef tasting invitations.
          </p>

          <form onSubmit={handleSubscribe} className="space-y-2">
            <div className="relative">
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/60 pr-10"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 p-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-lg transition-colors"
                title="Subscribe"
              >
                <IconSend size={14} />
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <IconShield size={12} className="text-emerald-400" />
              <span>We value your privacy. Unsubscribe anytime.</span>
            </div>
          </form>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          © {new Date().getFullYear()} Aurelia Grand Resort & Spa. All rights reserved.
        </div>
        <div className="flex items-center gap-6">
          <span className="hover:text-slate-400 cursor-pointer">Privacy Charter</span>
          <span className="hover:text-slate-400 cursor-pointer">Terms of Luxury Stay</span>
          <span className="hover:text-slate-400 cursor-pointer">Security Protocol</span>
          <button
            onClick={() => setPortalMode('admin')}
            className="hover:text-slate-400 cursor-pointer text-slate-600 transition-colors"
            title="Authorized Staff Portal"
          >
            Staff Portal
          </button>
        </div>
      </div>
    </footer>
  );
};
