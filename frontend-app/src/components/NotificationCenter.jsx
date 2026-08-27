import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { IconBell, IconVolume2, IconVolumeX, IconX, IconCheckCircle, IconClock, IconUtensils } from './Icons';

export const NotificationCenter = () => {
  const { notifications, unreadCount, markAllNotificationsRead, clearNotifications, isSoundMuted, toggleSound } = useHotel();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all focus:outline-none"
        title="Notifications"
      >
        <IconBell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute -right-12 sm:right-0 mt-3 w-[calc(100vw-32px)] max-w-[340px] sm:max-w-none sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-scale-up">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2">
                <IconBell size={16} className="text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Room Service Alerts</h3>
                {unreadCount > 0 && (
                  <span className="bg-amber-500/20 text-amber-400 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-500/30">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={toggleSound}
                  className={`p-1.5 rounded-lg border text-xs transition-colors ${isSoundMuted
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                    }`}
                  title={isSoundMuted ? 'Unmute alert audio chime' : 'Mute alert audio chime'}
                >
                  {isSoundMuted ? <IconVolumeX size={14} /> : <IconVolume2 size={14} />}
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <IconX size={14} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs">
                  <IconUtensils size={24} className="mx-auto mb-2 opacity-40 text-slate-400" />
                  No room service notifications yet
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 transition-colors ${!item.read ? 'bg-amber-500/5 hover:bg-amber-500/10' : 'hover:bg-slate-800/50'
                      }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 p-1.5 rounded-lg bg-slate-800 text-amber-400 shrink-0 border border-slate-700">
                        {item.type === 'status_updated' && item.status === 'Delivered' ? (
                          <IconCheckCircle size={14} className="text-emerald-400" />
                        ) : item.type === 'status_updated' && item.status === 'Preparing' ? (
                          <IconClock size={14} className="text-amber-400" />
                        ) : (
                          <IconUtensils size={14} className="text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-slate-100 truncate">{item.title}</span>
                          <span className="text-[10px] text-slate-500 shrink-0">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                          {item.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-t border-slate-800 text-[11px]">
                <button
                  onClick={markAllNotificationsRead}
                  className="text-slate-400 hover:text-amber-400 transition-colors font-medium"
                >
                  Mark all read
                </button>
                <button
                  onClick={clearNotifications}
                  className="text-slate-500 hover:text-rose-400 transition-colors"
                >
                  Clear log
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
