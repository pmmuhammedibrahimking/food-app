import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { IconChefHat, IconClock, IconCheckCircle, IconUtensils, IconFilter } from './Icons';

export const KitchenDisplay = () => {
  const { diningOrders, updateOrderStatus } = useHotel();
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredOrders = diningOrders.filter((order) => {
    if (filterStatus === 'Preparing') return order.status === 'Preparing';
    if (filterStatus === 'Delivered') return order.status === 'Delivered';
    return true;
  });

  const preparingCount = diningOrders.filter((o) => o.status === 'Preparing').length;
  const deliveredCount = diningOrders.filter((o) => o.status === 'Delivered').length;

  return (
    <div className="space-y-6">
      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <IconChefHat size={26} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Kitchen Display System (KDS)
              <span className="text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded-full font-semibold">
                Live Kitchen Feed
              </span>
            </h2>
            <p className="text-xs text-slate-400">Real-time room service kitchen orders & butler status workflow</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-stretch sm:self-auto">
          <button
            onClick={() => setFilterStatus('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterStatus === 'All'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            All ({diningOrders.length})
          </button>
          <button
            onClick={() => setFilterStatus('Preparing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${filterStatus === 'Preparing'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            Preparing ({preparingCount})
          </button>
          <button
            onClick={() => setFilterStatus('Delivered')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterStatus === 'Delivered'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            Delivered ({deliveredCount})
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <IconUtensils size={36} className="mx-auto mb-3 text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-300">No Orders in this View</h3>
          <p className="text-xs text-slate-500 mt-1">
            {filterStatus === 'Preparing'
              ? 'No room service orders currently being prepared in the kitchen.'
              : filterStatus === 'Delivered'
                ? 'No delivered orders in recent history.'
                : 'Waiting for room service orders from guests...'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.map((order) => {
            const isPreparing = order.status === 'Preparing';
            const isDelivered = order.status === 'Delivered';

            return (
              <div
                key={order.id}
                className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all relative overflow-hidden ${isPreparing
                    ? 'border-amber-500/40 shadow-lg shadow-amber-500/5'
                    : 'border-slate-800 opacity-90'
                  }`}
              >
                {/* Top Banner */}
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                        Order #{order.id}
                      </span>
                      <h3 className="text-base font-extrabold text-amber-400 flex items-center gap-1.5">
                        Room {order.roomNumber}
                      </h3>
                    </div>

                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${isPreparing
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        }`}
                    >
                      {isPreparing && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>}
                      {isDelivered && <IconCheckCircle size={14} />}
                      {order.status}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span className="font-medium text-slate-200">{order.guestName}</span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <IconClock size={13} /> {order.time || 'Just now'}
                    </span>
                  </div>
                </div>

                {/* Culinary Items */}
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Ordered Dishes
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-200">
                    {Array.isArray(order.items) ? (
                      order.items.map((item, idx) => (
                        <li key={idx} className="flex justify-between items-center">
                          <span className="font-medium">
                            {typeof item === 'string' ? item : `${item.name} × ${item.quantity}`}
                          </span>
                          {typeof item === 'object' && item.price && (
                            <span className="text-slate-400 text-[11px]">${item.price * item.quantity}</span>
                          )}
                        </li>
                      ))
                    ) : (
                      <li>{String(order.items)}</li>
                    )}
                  </ul>

                  {order.specialInstructions && (
                    <div className="pt-2 border-t border-slate-800/80 mt-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                        Chef Note:
                      </span>
                      <p className="text-[11px] text-slate-300 italic mt-0.5">
                        "{order.specialInstructions}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer & Action Buttons */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500">Total Bill</span>
                    <div className="text-sm font-extrabold text-emerald-400">${order.totalAmount}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isPreparing ? (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'Delivered')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                      >
                        <IconCheckCircle size={14} />
                        Mark Delivered
                      </button>
                    ) : (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'Preparing')}
                        className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all"
                      >
                        <IconClock size={14} />
                        Set Preparing
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
