import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { IconSparkles, IconCrown, IconUsers, IconCalendar, IconRefresh } from './Icons';

export const AnalyticsDashboard = () => {
  const { bookings = [], rooms = [], guests = [] } = useHotel();
  const [timeRange, setTimeRange] = useState('8M'); // '8M' | 'YTD' | '1Y'
  const [hoveredRevenueIndex, setHoveredRevenueIndex] = useState(null);

  // Data 1: Revenue Trends Dataset
  const revenueTrendsData = [
    { month: 'Jan', revenue: 24500, target: 22000 },
    { month: 'Feb', revenue: 28200, target: 25000 },
    { month: 'Mar', revenue: 34000, target: 30000 },
    { month: 'Apr', revenue: 39800, target: 35000 },
    { month: 'May', revenue: 45200, target: 40000 },
    { month: 'Jun', revenue: 52600, target: 45000 },
    { month: 'Jul', revenue: 61000, target: 50000 },
    { month: 'Aug', revenue: 68400, target: 55000 }
  ];

  // Data 2: Occupancy Rate Dataset
  const occupancyRateData = [
    { month: 'Jan', occupancy: 68 },
    { month: 'Feb', occupancy: 72 },
    { month: 'Mar', occupancy: 78 },
    { month: 'Apr', occupancy: 82 },
    { month: 'May', occupancy: 88 },
    { month: 'Jun', occupancy: 94 },
    { month: 'Jul', occupancy: 96 },
    { month: 'Aug', occupancy: 91 }
  ];

  // Data 3: Top Room Types Breakdown Dataset
  const topRoomTypesData = [
    { name: 'Penthouse', value: 48500, bookings: 32, percent: 35.4, color: '#D4AF37' },
    { name: 'Villa', value: 36000, bookings: 28, percent: 26.3, color: '#10B981' },
    { name: 'Suite', value: 28400, bookings: 44, percent: 20.7, color: '#3B82F6' },
    { name: 'Executive', value: 14200, bookings: 36, percent: 10.4, color: '#F59E0B' },
    { name: 'Standard', value: 9900, bookings: 52, percent: 7.2, color: '#8B5CF6' }
  ];

  // Data 4: Customer Retention Dataset (New vs Repeat)
  const customerRetentionData = [
    { month: 'Jan', newGuests: 28, repeatGuests: 14, rate: 33 },
    { month: 'Feb', newGuests: 30, repeatGuests: 18, rate: 37 },
    { month: 'Mar', newGuests: 35, repeatGuests: 25, rate: 41 },
    { month: 'Apr', newGuests: 38, repeatGuests: 32, rate: 45 },
    { month: 'May', newGuests: 42, repeatGuests: 40, rate: 48 },
    { month: 'Jun', newGuests: 45, repeatGuests: 52, rate: 53 },
    { month: 'Jul', newGuests: 48, repeatGuests: 65, rate: 57 },
    { month: 'Aug', newGuests: 50, repeatGuests: 72, rate: 59 }
  ];

  const totalRevenue = revenueTrendsData.reduce((sum, d) => sum + d.revenue, 0);
  const avgOccupancy = Math.round(
    occupancyRateData.reduce((sum, d) => sum + d.occupancy, 0) / occupancyRateData.length
  );

  // Helper calculation for Revenue SVG Polyline Points
  const maxRevenue = 75000;
  const chartHeight = 180;
  const chartWidth = 500;

  const points = revenueTrendsData
    .map((d, i) => {
      const x = (i / (revenueTrendsData.length - 1)) * chartWidth;
      const y = chartHeight - (d.revenue / maxRevenue) * chartHeight;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `0,${chartHeight} ${points} ${chartWidth},${chartHeight}`;

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {/* Top Header & Range Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
            <IconSparkles size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold font-serif tracking-wide text-slate-100">
              Executive Analytics & Performance Intelligence
            </h1>
            <p className="text-xs text-slate-400">
              Real-time revenue trends, occupancy matrix, room yields, and guest retention benchmarks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {['8M', 'YTD', '1Y'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeRange === range
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total YTD Revenue</span>
            <span className="text-emerald-400 font-bold">+24.8% YoY</span>
          </div>
          <div className="text-2xl font-extrabold text-amber-400">${totalRevenue.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400">Avg Monthly: ${(totalRevenue / 8).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Avg Occupancy Rate</span>
            <span className="text-amber-400 font-bold">Target: 85%</span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">{avgOccupancy}%</div>
          <div className="text-[11px] text-slate-400">Peak Month: 96% (July)</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Customer Retention</span>
            <span className="text-blue-400 font-bold">VIP Growth</span>
          </div>
          <div className="text-2xl font-extrabold text-blue-400">59.0%</div>
          <div className="text-[11px] text-slate-400">72 Repeat vs 50 New Guests</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Average RevPAR</span>
            <span className="text-purple-400 font-bold">Yield High</span>
          </div>
          <div className="text-2xl font-extrabold text-purple-400">$342 / night</div>
          <div className="text-[11px] text-slate-400">Top Yield: Penthouse ($1,500/n)</div>
        </div>
      </div>

      {/* Charts Grid Row 1: Revenue Trends & Occupancy Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Revenue Trends Area Chart */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                Revenue Growth Trends
              </h2>
              <p className="text-[11px] text-slate-400">Monthly revenue trajectory ($USD)</p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400">$68.4K Current</span>
          </div>

          <div className="relative pt-4">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`} className="w-full h-56 overflow-visible">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => (
                <line
                  key={idx}
                  x1="0"
                  y1={chartHeight * ratio}
                  x2={chartWidth}
                  y2={chartHeight * ratio}
                  stroke="#1E293B"
                  strokeDasharray="4 4"
                />
              ))}

              {/* Gradient Area Fill */}
              <polygon points={areaPoints} fill="url(#areaGrad)" />

              {/* Polyline */}
              <polyline points={points} fill="none" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" />

              {/* Data Interactive Dots & Labels */}
              {revenueTrendsData.map((d, i) => {
                const x = (i / (revenueTrendsData.length - 1)) * chartWidth;
                const y = chartHeight - (d.revenue / maxRevenue) * chartHeight;
                const isHovered = hoveredRevenueIndex === i;

                return (
                  <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredRevenueIndex(i)} onMouseLeave={() => setHoveredRevenueIndex(null)}>
                    <circle cx={x} cy={y} r={isHovered ? '7' : '4'} fill="#D4AF37" stroke="#0F172A" strokeWidth="2" />
                    <text x={x} y={chartHeight + 20} textAnchor="middle" fill="#64748B" fontSize="10" fontWeight="600">
                      {d.month}
                    </text>

                    {isHovered && (
                      <g>
                        <rect x={x - 40} y={y - 30} width="80" height="22" rx="6" fill="#0F172A" stroke="#D4AF37" strokeWidth="1" />
                        <text x={x} y={y - 15} textAnchor="middle" fill="#F8FAFC" fontSize="10" fontWeight="bold">
                          ${d.revenue.toLocaleString()}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Chart 2: Occupancy Rate Bar Chart */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                Monthly Occupancy Rate (%)
              </h2>
              <p className="text-[11px] text-slate-400">Occupancy volume vs 85% target threshold</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">91% Current</span>
          </div>

          <div className="h-56 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-2">
            {occupancyRateData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-bold text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                  {d.occupancy}%
                </span>
                <div className="w-full bg-slate-950 rounded-t-lg overflow-hidden h-40 flex items-end p-0.5">
                  <div
                    className={`w-full rounded-t-md transition-all duration-500 ${
                      d.occupancy >= 85 ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-amber-500'
                    }`}
                    style={{ height: `${d.occupancy}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">{d.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Grid Row 2: Top Room Types & Customer Retention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Top Room Types Breakdown */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                Top Room Types Yield & Revenue Share
              </h2>
              <p className="text-[11px] text-slate-400">Revenue generation breakdown by room category</p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {topRoomTypesData.map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></span>
                    <span className="font-bold text-slate-200">{cat.name} Tier</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">{cat.bookings} Bookings</span>
                    <span className="font-bold text-amber-400">${cat.value.toLocaleString()} ({cat.percent}%)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${cat.percent}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 4: Customer Retention Bar Chart */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                Customer Retention (New vs Repeat Guests)
              </h2>
              <p className="text-[11px] text-slate-400">Monthly guest acquisition vs repeat stay volume</p>
            </div>
            <span className="text-xs font-mono font-bold text-purple-400">59% Retention</span>
          </div>

          <div className="h-56 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-2">
            {customerRetentionData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1 h-40">
                  {/* New Guests Bar */}
                  <div
                    className="w-1/2 bg-blue-500 rounded-t-md transition-all"
                    style={{ height: `${(d.newGuests / 80) * 100}%` }}
                    title={`New Guests: ${d.newGuests}`}
                  />
                  {/* Repeat Guests Bar */}
                  <div
                    className="w-1/2 bg-amber-400 rounded-t-md transition-all"
                    style={{ height: `${(d.repeatGuests / 80) * 100}%` }}
                    title={`Repeat Guests: ${d.repeatGuests}`}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">{d.month}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 text-xs pt-1 border-t border-slate-800">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-500"></span> First-Time Guests
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-400"></span> Repeat & VIP Guests
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
