import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { IconUsers, IconCrown, IconSearch, IconSparkles, IconCalendar, IconX, IconTrash } from './Icons';
import { ConfirmModal } from './ConfirmModal';
import { EmptyState } from './EmptyState';

export const GuestManagement = () => {
  const { guests = [], bookings = [], addGuestNote, updateGuestTags, updateGuestPreferences, deleteGuest } = useHotel();

  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilter, setTagFilter] = useState('All'); // 'All' | 'VIP' | 'Frequent' | 'Risk'
  const [activeTimelineGuest, setActiveTimelineGuest] = useState(null);
  const [editingPreferencesGuest, setEditingPreferencesGuest] = useState(null);
  const [guestToDelete, setGuestToDelete] = useState(null);
  const [foodPrefInput, setFoodPrefInput] = useState('');
  const [roomPrefInput, setRoomPrefInput] = useState('');
  const [newNoteInputs, setNewNoteInputs] = useState({});

  const availableTags = ['VIP', 'Frequent', 'Risk'];

  // Filtering logic
  const filteredGuests = guests.filter((guest) => {
    const term = searchTerm.toLowerCase().trim();
    const searchMatch =
      !term ||
      guest.name.toLowerCase().includes(term) ||
      guest.email.toLowerCase().includes(term) ||
      (guest.phone && guest.phone.toLowerCase().includes(term));

    const guestTags = guest.tags || [];
    const tagMatch =
      tagFilter === 'All' ||
      guestTags.includes(tagFilter) ||
      (tagFilter === 'VIP' && (guest.vipStatus === 'Diamond' || guest.vipStatus === 'Gold'));

    return searchMatch && tagMatch;
  });

  const handleToggleTag = (guest, tagToToggle) => {
    const currentTags = guest.tags || [];
    const newTags = currentTags.includes(tagToToggle)
      ? currentTags.filter((t) => t !== tagToToggle)
      : [...currentTags, tagToToggle];
    updateGuestTags(guest.id, newTags);
  };

  const handleAddNote = (guestId) => {
    const text = newNoteInputs[guestId] || '';
    if (!text.trim()) return;
    addGuestNote(guestId, text);
    setNewNoteInputs({ ...newNoteInputs, [guestId]: '' });
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    if (!editingPreferencesGuest) return;
    updateGuestPreferences(editingPreferencesGuest.id, foodPrefInput, roomPrefInput);
    setEditingPreferencesGuest(null);
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {/* Top Search & Tag Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Tag Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {['All', 'VIP', 'Frequent', 'Risk'].map((tag) => (
              <button
                key={tag}
                onClick={() => setTagFilter(tag)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${tagFilter === tag
                    ? tag === 'VIP'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-sm'
                      : tag === 'Frequent'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                        : tag === 'Risk'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-sm'
                          : 'bg-slate-800 text-slate-100 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
              >
                {tag === 'VIP' && '👑 '}
                {tag === 'Frequent' && '⚡ '}
                {tag === 'Risk' && '⚠️ '}
                {tag}
              </button>
            ))}
          </div>

          <div className="hidden sm:block h-6 w-px bg-slate-800" />

          {/* Search Input */}
          <div className="relative flex-1 sm:flex-initial min-w-[200px] w-full sm:w-64">
            <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search guest profiles, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-amber-500/50 placeholder-slate-500"
            />
          </div>
        </div>

        <div className="text-xs text-slate-400 font-medium whitespace-nowrap">
          Showing <span className="text-amber-400 font-bold">{filteredGuests.length}</span> CRM guest profiles
        </div>
      </div>

      {/* Guest Profiles Cards Grid */}
      {filteredGuests.length === 0 ? (
        <EmptyState
          icon={IconUsers}
          title="No Guest Profiles Found"
          message="No guest records match your selected tag filter or search criteria."
          actionText="Reset Filters"
          onAction={() => {
            setSearchTerm('');
            setTagFilter('All');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredGuests.map((guest) => {
            const guestTags = guest.tags || [];
            const isVip = guestTags.includes('VIP') || guest.vipStatus === 'Diamond' || guest.vipStatus === 'Gold';

            // Get stay history / timeline for this guest
            const guestBookings = bookings.filter(
              (b) => b.guestEmail && b.guestEmail.toLowerCase() === guest.email.toLowerCase()
            );

            return (
              <div
                key={guest.id}
                className={`bg-slate-900/90 border rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between space-y-4 transition-all ${isVip ? 'border-amber-500/30 bg-slate-900/95' : 'border-slate-800'
                  }`}
              >
                <div className="space-y-4">
                  {/* Header: Avatar, Name, Email, VIP Badge & Delete Action */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base shadow-md flex-shrink-0 ${isVip
                            ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-amber-500/20'
                            : 'bg-slate-800 text-slate-200 border border-slate-700'
                          }`}
                      >
                        {guest.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm sm:text-base font-bold text-slate-100 truncate" title={guest.name}>{guest.name}</h3>
                          {isVip && <IconCrown size={15} className="text-amber-400 flex-shrink-0" />}
                        </div>
                        <div className="text-[11px] sm:text-xs text-slate-400 truncate" title={guest.email}>{guest.email}</div>
                        <div className="text-[10.5px] sm:text-[11px] text-amber-400 font-mono truncate">{guest.phone}</div>
                      </div>
                    </div>

                    {/* Tier Badge & Delete Profile Button */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span
                        className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold border whitespace-nowrap ${isVip
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                      >
                        {guest.vipStatus} Tier
                      </span>
                      <button
                        onClick={() => setGuestToDelete(guest)}
                        title="Delete Guest Profile"
                        className="p-1 sm:p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:border-rose-500/50 transition-all flex items-center justify-center gap-1 text-[10.5px] sm:text-[11px] font-bold h-7 flex-shrink-0"
                        aria-label="Delete Guest Profile"
                      >
                        <IconTrash size={13} className="flex-shrink-0" />
                        <span className="hidden 2xl:inline">Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* CRM Tags Badges Row with Tag Toggle Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 mr-1">Tags:</span>
                    {availableTags.map((tag) => {
                      const isTagged = guestTags.includes(tag);
                      const tagStyles = {
                        VIP: isTagged
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300',
                        Frequent: isTagged
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300',
                        Risk: isTagged
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                          : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                      };

                      return (
                        <button
                          key={tag}
                          onClick={() => handleToggleTag(guest, tag)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all ${tagStyles[tag]}`}
                        >
                          {isTagged ? `✓ ${tag}` : `+ ${tag}`}
                        </button>
                      );
                    })}
                  </div>

                  {/* Stats Summary Bar */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-slate-400">Total Stays</div>
                      <div className="text-sm font-extrabold text-slate-100">{guest.stays || guestBookings.length} Visits</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-slate-400">Total Spent</div>
                      <div className="text-sm font-extrabold text-emerald-400">${(guest.totalSpent || 0).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-slate-400">History Records</div>
                      <div className="text-sm font-extrabold text-amber-400">{guestBookings.length} Stays</div>
                    </div>
                  </div>

                  {/* Structured Guest Preferences Section */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                        <IconSparkles size={14} /> Guest Preferences
                      </span>
                      <button
                        onClick={() => {
                          setEditingPreferencesGuest(guest);
                          setFoodPrefInput(guest.foodPreferences || guest.preferences || '');
                          setRoomPrefInput(guest.roomPreferences || 'High floor penthouse, Quiet wing');
                        }}
                        className="text-[10px] text-slate-400 hover:text-amber-400 underline font-semibold"
                      >
                        Edit Prefs
                      </button>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-start gap-2">
                        <span className="text-slate-400 font-semibold min-w-16">F&B:</span>
                        <span className="text-slate-200 font-medium">
                          {guest.foodPreferences || guest.preferences || 'Standard Dining'}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-slate-400 font-semibold min-w-16">Room:</span>
                        <span className="text-slate-200 font-medium">
                          {guest.roomPreferences || 'Quiet Wing, High Floor'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Internal Staff Notes Section */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="text-xs font-bold text-slate-300">Internal Staff & Concierge Notes</div>

                    {/* List of existing notes */}
                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                      {(guest.notes || []).length === 0 ? (
                        <div className="text-[11px] text-slate-500 italic">No internal notes added yet.</div>
                      ) : (
                        guest.notes.map((note) => (
                          <div key={note.id} className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span className="font-semibold text-amber-400">{note.author}</span>
                              <span>{note.date}</span>
                            </div>
                            <p className="text-slate-200">{note.text}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Note Input Bar */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Add internal note for staff..."
                        value={newNoteInputs[guest.id] || ''}
                        onChange={(e) => setNewNoteInputs({ ...newNoteInputs, [guest.id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddNote(guest.id);
                        }}
                        className="flex-1 bg-slate-900 border border-slate-800 text-xs text-slate-200 px-3 py-1.5 rounded-xl focus:outline-none focus:border-amber-500/50"
                      />
                      <button
                        onClick={() => handleAddNote(guest.id)}
                        className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-xl border border-amber-500/30 transition-all"
                      >
                        Add Note
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Guest Timeline / Booking History Toggle */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setActiveTimelineGuest(activeTimelineGuest?.id === guest.id ? null : guest)}
                    className="w-full bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold py-2 px-3 rounded-xl border border-slate-700/60 flex items-center justify-center gap-2 transition-all"
                  >
                    <IconCalendar size={14} className="text-amber-400" />
                    <span>{activeTimelineGuest?.id === guest.id ? 'Hide Booking History' : `View Stay Timeline (${guestBookings.length})`}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Guest Timeline (Booking History) Modal Drawer */}
      {activeTimelineGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-100 space-y-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <IconCalendar size={20} className="text-amber-400" />
                <h2 className="text-base font-bold text-slate-100">
                  Guest Stay Timeline — {activeTimelineGuest.name}
                </h2>
              </div>
              <button
                onClick={() => setActiveTimelineGuest(null)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800"
              >
                <IconX size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <div className="font-bold text-slate-100 text-sm">{activeTimelineGuest.name}</div>
                  <div className="text-slate-400">{activeTimelineGuest.email} • {activeTimelineGuest.phone}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-extrabold text-amber-400">{activeTimelineGuest.vipStatus} Member</div>
                  <div className="text-emerald-400 font-bold">${(activeTimelineGuest.totalSpent || 0).toLocaleString()} Total Spent</div>
                </div>
              </div>

              <div className="font-bold text-slate-300">Chronological Stay History</div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {bookings.filter((b) => b.guestEmail && b.guestEmail.toLowerCase() === activeTimelineGuest.email.toLowerCase()).length === 0 ? (
                  <div className="text-center py-6 text-slate-500">No booking history records found for this guest.</div>
                ) : (
                  bookings
                    .filter((b) => b.guestEmail && b.guestEmail.toLowerCase() === activeTimelineGuest.email.toLowerCase())
                    .map((b) => (
                      <div
                        key={b.id}
                        className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-amber-400">{b.id}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${b.status === 'Checked-In'
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  : b.status === 'Confirmed'
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                }`}
                            >
                              {b.status}
                            </span>
                          </div>
                          <div className="font-semibold text-slate-200">Room {b.roomNumber} ({b.roomCategory})</div>
                          <div className="text-[11px] text-slate-400">
                            {b.checkIn} → {b.checkOut} ({b.totalNights} Nights)
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-extrabold text-emerald-400">${b.totalAmount.toLocaleString()}</div>
                          <div className="text-[10px] text-slate-400 font-medium">Payment: {b.paymentStatus || 'Paid'}</div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            <div className="flex justify-end p-4 border-t border-slate-800 bg-slate-950/40">
              <button
                onClick={() => setActiveTimelineGuest(null)}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl"
              >
                Close Timeline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Preferences Modal */}
      {editingPreferencesGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-slate-100 space-y-4">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h2 className="text-base font-bold text-slate-100">
                Edit Preferences — {editingPreferencesGuest.name}
              </h2>
              <button
                onClick={() => setEditingPreferencesGuest(null)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800"
              >
                <IconX size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePreferences} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Food & Beverage Preferences</label>
                <textarea
                  rows="2"
                  value={foodPrefInput}
                  onChange={(e) => setFoodPrefInput(e.target.value)}
                  placeholder="e.g. Pinot Noir, Organic Gluten-free, Espresso"
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Room & Stay Preferences</label>
                <textarea
                  rows="2"
                  value={roomPrefInput}
                  onChange={(e) => setRoomPrefInput(e.target.value)}
                  placeholder="e.g. High Floor Penthouse, Quiet Wing, Jacuzzi"
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPreferencesGuest(null)}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm"
                >
                  Save Preferences
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Guest Confirmation Dialog Modal */}
      <ConfirmModal
        isOpen={!!guestToDelete}
        title="Delete Guest Profile"
        message={`Are you sure you want to permanently delete the CRM record for '${guestToDelete?.name}'? This action cannot be undone.`}
        confirmText="Delete Profile"
        type="danger"
        onConfirm={() => {
          if (guestToDelete) {
            deleteGuest(guestToDelete.id);
            setGuestToDelete(null);
          }
        }}
        onClose={() => setGuestToDelete(null)}
      />
    </div>
  );
};
