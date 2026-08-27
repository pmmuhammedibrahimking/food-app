import React from 'react';
import {
  IconCrown,
  IconStar,
  IconAward,
  IconSparkles,
  IconShield,
  IconUtensils,
  IconHeart,
  IconUsers
} from '../Icons';

export const CustomerAbout = () => {
  const leadershipTeam = [
    {
      name: 'Chef Jean-Luc Vaneau',
      role: 'Executive Chef de Cuisine',
      bio: 'Former 3-Michelin star head chef in Paris, curating French-Mediterranean coastal gastronomy.',
      avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Elena Rossi',
      role: 'Master Head Sommelier',
      bio: 'Curator of our 10,000-bottle Grand Reserve cellar and rare vintage champagne collections.',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Arthur Sterling',
      role: 'Chief Concierge (Les Clefs d’Or)',
      bio: '30 years managing bespoke presidential requests, private yacht charters, and VIP arrivals.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
    }
  ];

  const accolades = [
    { title: 'World Luxury Hotel Awards 2026', subtitle: 'Best Coastal Resort Worldwide', year: '2026' },
    { title: 'Forbes Travel Guide 5-Star Rating', subtitle: 'Exceptional Service & Sanctum Accommodations', year: '2025 - 2026' },
    { title: 'Michelin Key Excellence', subtitle: 'Outstanding Gastronomy & Suite Architecture', year: '2026' },
    { title: 'Global Eco-Luxury Platinum Certificate', subtitle: '100% Zero-Carbon & Marine Conservation', year: '2025' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16 animate-fade-in font-sans text-slate-200">
      {/* Hero Header */}
      <section className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
          <IconSparkles size={14} />
          <span>OUR HERITAGE & VISION</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-slate-100 tracking-tight">
          A Legacy of Coastal Grandeur
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Founded on the principle that true luxury is deeply personal, Aurelia Grand Resort stands as an architectural tribute to the harmony between ocean vistas and bespoke hospitality.
        </p>
      </section>

      {/* Story & Philosophy Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
            THE AURELIA PHILOSOPHY
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-100">
            Sanctuary Built for the Discerning Soul
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Perched atop coastal bluffs overlooking tranquil azure waters, Aurelia Grand Resort was conceived as a private enclave where world leaders, visionaries, and discerning families can escape the noise of modernity.
          </p>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Every suite and private villa has been engineered with natural Italian stone, organic teak wood, floor-to-ceiling glass, and dedicated butler pantries to ensure discreet, world-class comfort.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div className="font-serif text-2xl font-bold text-amber-400">100%</div>
              <div className="text-xs text-slate-300 font-semibold mt-1">Private Oceanfront Views</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div className="font-serif text-2xl font-bold text-amber-400">24/7</div>
              <div className="text-xs text-slate-300 font-semibold mt-1">Dedicated Butler Concierge</div>
            </div>
          </div>
        </div>

        <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl group">
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80"
            alt="Resort Grounds"
            className="w-full h-96 sm:h-[420px] object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 bg-slate-950/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800">
            <div className="font-serif font-bold text-sm text-slate-100">Aurelia Oceanfront Sanctuary</div>
            <div className="text-[11px] text-amber-400">Beverly Hills Coastal Bluff Enclave</div>
          </div>
        </div>
      </section>

      {/* Leadership & Culinary Masters */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
            MASTERS OF HOSPITALITY
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-100">
            Our Executive Culinary & Concierge Team
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {leadershipTeam.map((member, i) => (
            <div
              key={i}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-amber-500/30 transition-all text-center group"
            >
              <img
                src={member.avatar}
                alt={member.name}
                className="w-24 h-24 mx-auto rounded-full object-cover border-2 border-amber-400 shadow-xl transition-transform group-hover:scale-105"
              />
              <div className="space-y-1">
                <h3 className="font-bold text-base text-slate-100">{member.name}</h3>
                <div className="text-xs font-semibold text-amber-400">{member.role}</div>
                <p className="text-xs text-slate-400 pt-2 leading-relaxed">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Accolades & Awards */}
      <section className="bg-slate-900/80 border border-amber-500/30 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <IconAward size={26} />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-100">
            International Honors & Accolades
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Recognized by global hospitality rating institutions for unparalleled service standards.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {accolades.map((acc, i) => (
            <div
              key={i}
              className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl space-y-2 text-center hover:border-amber-500/40 transition-colors"
            >
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">{acc.year}</div>
              <h3 className="font-bold text-xs text-slate-100">{acc.title}</h3>
              <p className="text-[11px] text-slate-400">{acc.subtitle}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
