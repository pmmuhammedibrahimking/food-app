import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { useTranslation } from '../i18n/I18nContext';
import { getFoodRecommendations } from '../services/recommendationEngine';
import { IconUtensils, IconPlus, IconClock, IconCheckCircle, IconX, IconChefHat } from './Icons';
import { KitchenDisplay } from './KitchenDisplay';
import { RecommendationWidget } from './RecommendationWidget';
import { EmptyState } from './EmptyState';

export const DiningMenu = () => {
  const { diningMenu, diningOrders, rooms, placeRoomServiceOrder, updateOrderStatus } = useHotel();
  const { t } = useTranslation();
  const [mainView, setMainView] = useState('menu'); // 'menu' | 'kitchen'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [pairedItem, setPairedItem] = useState(null);

  const [orderForm, setOrderForm] = useState({
    roomNumber: '101',
    guestName: '',
    quantity: 1,
    specialInstructions: ''
  });

  const categories = ['All', 'Fine Dining', 'Breakfast', 'Main Course', 'Beverages & Wine', 'Spa & Wellness', 'Desserts'];

  const filteredMenu = diningMenu.filter(
    (item) => selectedCategory === 'All' || item.category === selectedCategory
  );

  const handleOpenOrderModal = (item) => {
    setSelectedMenuItem(item);
    setPairedItem(null);
    setIsOrderModalOpen(true);
    setOrderForm({
      roomNumber: '101',
      guestName: 'Lord Alexander Wright',
      quantity: 1,
      specialInstructions: ''
    });
  };

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    if (!selectedMenuItem || !orderForm.roomNumber) return;

    const itemsToOrder = [
      { name: selectedMenuItem.name, quantity: orderForm.quantity, price: selectedMenuItem.price }
    ];

    if (pairedItem) {
      itemsToOrder.push({ name: pairedItem.name, quantity: 1, price: pairedItem.price });
    }

    const totalAmount =
      selectedMenuItem.price * orderForm.quantity + (pairedItem ? pairedItem.price : 0);

    placeRoomServiceOrder({
      roomNumber: orderForm.roomNumber,
      guestName: orderForm.guestName || 'Room Service Guest',
      items: itemsToOrder,
      specialInstructions: orderForm.specialInstructions,
      totalAmount
    });

    setIsOrderModalOpen(false);
  };

  const preparingOrdersCount = diningOrders.filter((o) => o.status === 'Preparing').length;
  const foodRecommendationData = selectedMenuItem ? getFoodRecommendations(selectedMenuItem, diningMenu) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* View Switcher Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: 'rgba(15, 23, 42, 0.8)', padding: '0.75rem 1.25rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            className={`btn ${mainView === 'menu' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            onClick={() => setMainView('menu')}
          >
            <IconUtensils size={16} /> {t('dining')}
          </button>
          <button
            className={`btn ${mainView === 'kitchen' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}
            onClick={() => setMainView('kitchen')}
          >
            <IconChefHat size={16} /> {t('kitchenKDS')}
            {preparingOrdersCount > 0 && (
              <span className="badge badge-reserved" style={{ fontSize: '0.65rem', marginLeft: '0.3rem' }}>
                {preparingOrdersCount} {t('preparing')}
              </span>
            )}
          </button>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--gold-primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <IconUtensils size={18} /> 24/7 Room Service & Butler Dispatch
        </div>
      </div>

      {mainView === 'kitchen' ? (
        <KitchenDisplay />
      ) : (
        <>
          {/* Category Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div className="filter-tabs" style={{ marginBottom: 0 }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing {filteredMenu.length} Gourmet Dishes
            </div>
          </div>

          {/* Menu Grid */}
          {filteredMenu.length === 0 ? (
            <EmptyState
              icon={IconUtensils}
              title="No Dishes Found"
              message="No dining menu items match the selected category."
              actionText="Reset Category"
              onAction={() => setSelectedCategory('All')}
            />
          ) : (
            <div className="rooms-grid">
              {filteredMenu.map((item) => (
                <div className="room-card" key={item.id}>
                  <div className="room-img-container">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="room-img"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="room-price-tag">${item.price}</div>
                  </div>

                  <div className="room-details">
                    <div style={{ fontSize: '0.75rem', color: 'var(--gold-primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {item.category}
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '0.25rem 0' }}>{item.name}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{item.description}</p>

                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                      {item.tags && item.tags.map((tag, idx) => (
                        <span key={idx} className="amenity-chip" style={{ color: 'var(--gold-primary)', border: '1px solid rgba(212,175,55,0.3)' }}>
                          ★ {tag}
                        </span>
                      ))}
                    </div>

                    <button
                      className="btn btn-primary"
                      style={{ width: '100%', marginTop: 'auto', padding: '0.6rem' }}
                      onClick={() => handleOpenOrderModal(item)}
                    >
                      <IconUtensils size={16} /> {t('orderRoomService')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Order Room Service Modal with AI Pairing Suggestion */}
      {isOrderModalOpen && selectedMenuItem && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Order In-Room Dining</h2>
              <button className="modal-close" onClick={() => setIsOrderModalOpen(false)}>
                <IconX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitOrder}>
              <div className="modal-body">
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <img
                    src={selectedMenuItem.image}
                    alt={selectedMenuItem.name}
                    style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div>
                    <h4 style={{ fontWeight: '700' }}>{selectedMenuItem.name}</h4>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedMenuItem.description}</div>
                    <div style={{ fontWeight: '800', color: 'var(--gold-primary)', marginTop: '0.25rem' }}>${selectedMenuItem.price} per dish</div>
                  </div>
                </div>

                {/* AI Food & Wine Pairing Recommendation Widget */}
                {foodRecommendationData && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <RecommendationWidget
                      type="food"
                      data={foodRecommendationData}
                      onAction={(suggestedItem) => setPairedItem(suggestedItem)}
                    />
                    {pairedItem && (
                      <div className="text-xs text-emerald-400 font-bold mt-1.5 flex items-center gap-1">
                        <IconCheckCircle size={14} /> Added pairing: {pairedItem.name} (+${pairedItem.price})
                      </div>
                    )}
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Select Room Number</label>
                    <select
                      className="form-control"
                      value={orderForm.roomNumber}
                      onChange={(e) => setOrderForm({ ...orderForm, roomNumber: e.target.value })}
                      style={{ background: '#131B2E', color: '#F8FAFC' }}
                    >
                      {rooms.map((r) => (
                        <option key={r.id} value={r.number} style={{ background: '#131B2E', color: '#F8FAFC' }}>
                          Room {r.number} ({r.name})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      className="form-control"
                      value={orderForm.quantity}
                      onChange={(e) => setOrderForm({ ...orderForm, quantity: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Guest Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Guest Name"
                    value={orderForm.guestName}
                    onChange={(e) => setOrderForm({ ...orderForm, guestName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Special Kitchen Instructions</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Extra sauce, no peanuts, served hot"
                    value={orderForm.specialInstructions}
                    onChange={(e) => setOrderForm({ ...orderForm, specialInstructions: e.target.value })}
                  />
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontWeight: '800', color: '#10B981', fontSize: '1.1rem' }}>
                  <span>Total Order Bill:</span>
                  <span>
                    ${(
                      selectedMenuItem.price * orderForm.quantity + (pairedItem ? pairedItem.price : 0)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsOrderModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Dispatch Room Service (${(
                    selectedMenuItem.price * orderForm.quantity + (pairedItem ? pairedItem.price : 0)
                  ).toLocaleString()})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
