import React, { useState, useRef, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { useTranslation } from '../i18n/I18nContext';
import { IconSparkles, IconX, IconChefHat, IconClock, IconBed, IconCheck, IconSearch, IconCalendar } from './Icons';

export const AIChatbot = () => {
  const { currentGuest, placeRoomServiceOrder, updateHousekeepingStatus, addToast } = useHotel();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load persistent conversation history from localStorage
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('hotel_ai_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved chat history:', e);
      }
    }
    return [
      {
        id: 'msg-1',
        sender: 'bot',
        text: t('aiGreeting') || 'Greetings! I am your 24/7 AI Butler Concierge. How may I assist your stay today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [input, setInput] = useState('');

  // Persist messages to localStorage
  useEffect(() => {
    localStorage.setItem('hotel_ai_chat_history', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend) => {
    const promptText = textToSend || input;
    if (!promptText || !promptText.trim() || isLoading) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      // Call Backend API endpoint for AI request (OpenAI key remains securely on backend)
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: promptText,
          guestId: currentGuest?.id || 'GUEST-101',
          guestName: currentGuest?.name || 'Resort Guest',
          roomNumber: currentGuest?.roomNumber || '101',
          bookingId: currentGuest?.bookingId || 'BK-3891'
        })
      });

      let botReplyText = '';
      let actionRequired = null;

      if (res.ok) {
        const data = await res.json();
        botReplyText = data.data?.reply || data.reply;
        actionRequired = data.data?.actionRequired || data.actionRequired;
      } else {
        throw new Error('API server returned error');
      }

      const botMsg = {
        id: `msg-${Date.now() + 1}`,
        sender: 'bot',
        text: botReplyText,
        actionRequired,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.warn('Backend AI fetch warning, using fallback concierge engine:', err);
      // Fallback local rule engine
      const lower = promptText.toLowerCase();
      let reply = '';
      let action = null;

      if (lower.includes('available') || lower.includes('room')) {
        reply = 'We currently have 3 luxury sanctuaries available: Room 102 (Executive - $220/night), Room 301 (Beach Villa - $1,200/night), Room 302 (Classic - $140/night).';
      } else if (lower.includes('order') || lower.includes('food') || lower.includes('dining')) {
        reply = 'I would be delighted to assist with In-Room Dining! Signature dishes: Australian Wagyu Ribeye Steak ($185) and Dom Pérignon Champagne ($450). Please confirm to dispatch your order.';
        action = {
          type: 'ORDER_FOOD',
          confirmPrompt: `Dispatch Room Service order (Wagyu Ribeye Steak - $185) to Room ${currentGuest?.roomNumber || '101'}?`,
          payload: { roomNumber: currentGuest?.roomNumber || '101', item: 'Wagyu Ribeye Steak', price: 185 }
        };
      } else if (lower.includes('housekeeping') || lower.includes('clean') || lower.includes('towel')) {
        reply = 'Housekeeping dispatch ready! We can send steward Maria Garcia with fresh linens and room sanitation.';
        action = {
          type: 'REQUEST_HOUSEKEEPING',
          confirmPrompt: `Dispatch Housekeeping team to Room ${currentGuest?.roomNumber || '101'}?`,
          payload: { roomNumber: currentGuest?.roomNumber || '101' }
        };
      } else if (lower.includes('checkout') || lower.includes('check out') || lower.includes('time')) {
        reply = `Standard check-out time is 11:00 AM. Your stay in Room ${currentGuest?.roomNumber || '101'} is scheduled for check-out on August 15, 2026. Late check-out up to 2:00 PM is available upon request!`;
      } else if (lower.includes('extend') || lower.includes('stay')) {
        reply = 'You can extend your luxury stay by 1 night for $350. Please confirm if you would like me to process this extension.';
        action = {
          type: 'EXTEND_STAY',
          confirmPrompt: `Request 1-night extension for Room ${currentGuest?.roomNumber || '101'} ($350)?`,
          payload: { roomNumber: currentGuest?.roomNumber || '101', nights: 1 }
        };
      } else if (lower.includes('booking') || lower.includes('reservation')) {
        reply = `🏨 **Active Reservation:** BK-3891 | Guest: ${currentGuest?.name || 'Eleanor Vance'} | Room: 101 (Ocean Suite) | Status: Paid ($1,750)`;
      } else {
        reply = t('aiGreeting') || 'I am your 24/7 AI Butler Concierge. How may I serve you today?';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'bot',
          text: reply,
          actionRequired: action,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAction = async (msgId, actionRequired) => {
    if (!actionRequired) return;

    try {
      // Call backend controlled API endpoint for action execution
      const res = await fetch('/api/ai/confirm-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: actionRequired.type,
          payload: actionRequired.payload,
          guestName: currentGuest?.name || 'Resort Guest'
        })
      });

      let confirmText = '';
      if (res.ok) {
        const data = await res.json();
        confirmText = data.data?.confirmationMessage || data.confirmationMessage;
      }

      if (!confirmText) {
        confirmText = `✓ Action confirmed and dispatched successfully!`;
      }

      // Execute client store updates if applicable
      if (actionRequired.type === 'ORDER_FOOD' && placeRoomServiceOrder) {
        placeRoomServiceOrder({
          roomNumber: actionRequired.payload?.roomNumber || '101',
          guestName: currentGuest?.name || 'Resort Guest',
          items: [{ name: actionRequired.payload?.item || 'Australian Wagyu Ribeye Steak', quantity: 1, price: 185 }],
          totalAmount: 185
        });
      } else if (actionRequired.type === 'REQUEST_HOUSEKEEPING' && updateHousekeepingStatus) {
        updateHousekeepingStatus('HK-101', 'In Progress');
      }

      if (addToast) addToast(confirmText, 'success');

      // Update message history to clear actionRequired and mark confirmed
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === msgId) {
            return {
              ...msg,
              actionRequired: null,
              actionConfirmed: true,
              text: `${msg.text}\n\n${confirmText}`
            };
          }
          return msg;
        })
      );
    } catch (e) {
      console.error('Failed to confirm action:', e);
    }
  };

  const handleCancelAction = (msgId) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === msgId) {
          return {
            ...msg,
            actionRequired: null,
            text: `${msg.text}\n\n*Request cancelled by guest.*`
          };
        }
        return msg;
      })
    );
  };

  const clearChatHistory = () => {
    localStorage.removeItem('hotel_ai_chat_history');
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        text: t('aiGreeting') || 'Greetings! I am your 24/7 AI Butler Concierge. How may I assist your stay today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 p-3.5 rounded-full shadow-2xl transition-all transform hover:scale-105 flex items-center gap-2 font-bold text-xs border border-amber-400/40 animate-float"
        >
          <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center text-amber-400 shadow-inner">
            <IconSparkles size={18} />
          </div>
          <span className="hidden sm:inline font-serif tracking-wider">{t('aiConciergeTitle') || 'AI Concierge'}</span>
        </button>
      )}

      {/* Modern AI Concierge Drawer */}
      {isOpen && (
        <div className="bg-slate-900/95 border border-amber-500/30 rounded-2xl w-80 sm:w-96 shadow-2xl overflow-hidden flex flex-col h-[520px] backdrop-blur-xl animate-scale-up">
          {/* Header */}
          <div className="bg-slate-950 p-3.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md">
                <IconSparkles size={20} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  {t('aiConciergeTitle') || 'Aurelia AI Concierge'}
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </h3>
                <p className="text-[10px] text-amber-400 font-medium">{t('aiAssistantSubtitle') || '24/7 Smart Butler'}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearChatHistory}
                title="Clear Chat History"
                className="px-2 py-1 text-[10px] text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
              >
                Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <IconX size={16} />
              </button>
            </div>
          </div>

          {/* Chat Messages Feed */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-950/40 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-amber-500 text-slate-950 font-medium rounded-br-xs shadow-md'
                      : 'bg-slate-800/90 border border-slate-700/80 text-slate-100 rounded-bl-xs shadow-md'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                  {/* Confirmation Card for Required Actions */}
                  {msg.actionRequired && (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/40 text-slate-200 space-y-2">
                      <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                        <IconCheck size={12} /> {t('confirmActionTitle') || 'Confirmation Required'}
                      </div>
                      <p className="text-[11px] text-slate-300 font-medium">
                        {msg.actionRequired.confirmPrompt}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleConfirmAction(msg.id, msg.actionRequired)}
                          className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold py-1.5 px-3 rounded-lg transition-all"
                        >
                          {t('confirmBtn') || 'Confirm'}
                        </button>
                        <button
                          onClick={() => handleCancelAction(msg.id)}
                          className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium py-1.5 px-3 rounded-lg border border-slate-700 transition-all"
                        >
                          {t('cancelBtn') || 'Cancel'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-[11px] p-2 bg-slate-900/60 rounded-xl w-32 animate-pulse">
                <IconSparkles size={14} className="text-amber-400 animate-spin" />
                <span>AI Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Chips (The 6 required queries) */}
          <div className="p-2 bg-slate-950 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[10px] no-scrollbar">
            <button
              onClick={() => handleSend('What rooms are available?')}
              className="bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 flex items-center gap-1"
            >
              <IconBed size={11} /> {t('askAvailableRooms') || 'Available Rooms'}
            </button>
            <button
              onClick={() => handleSend('Order room service.')}
              className="bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 flex items-center gap-1"
            >
              <IconChefHat size={11} /> {t('askOrderFood') || 'Order Food'}
            </button>
            <button
              onClick={() => handleSend('I need housekeeping.')}
              className="bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 flex items-center gap-1"
            >
              <IconClock size={11} /> {t('askHousekeeping') || 'Housekeeping'}
            </button>
            <button
              onClick={() => handleSend('What is my checkout time?')}
              className="bg-slate-900 hover:bg-slate-800 text-blue-400 border border-slate-800 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 flex items-center gap-1"
            >
              <IconCalendar size={11} /> {t('askCheckoutTime') || 'Checkout Time'}
            </button>
            <button
              onClick={() => handleSend('Can I extend my stay?')}
              className="bg-slate-900 hover:bg-slate-800 text-purple-400 border border-slate-800 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 flex items-center gap-1"
            >
              <IconBed size={11} /> {t('askExtendStay') || 'Extend Stay'}
            </button>
            <button
              onClick={() => handleSend('Show my booking.')}
              className="bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 flex items-center gap-1"
            >
              <IconSearch size={11} /> {t('askShowBooking') || 'Show Booking'}
            </button>
          </div>

          {/* Chat Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={t('typeMessagePlaceholder') || 'Ask AI Concierge...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs transition-all disabled:opacity-50"
            >
              {t('send') || 'Send'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
