// Rule-based Smart Recommendation Engine for Room Upgrades & Dining Pairings

/**
 * Generates room upgrade suggestions based on current selection, capacity, and VIP tier
 */
export const getRoomUpgradeRecommendations = (currentRoom, allRooms) => {
  if (!currentRoom || !allRooms || allRooms.length === 0) return null;

  const roomHierarchy = ['Standard', 'Executive', 'Suite', 'Penthouse', 'Villa'];
  const currentIndex = roomHierarchy.indexOf(currentRoom.category);

  if (currentIndex === -1 || currentIndex >= roomHierarchy.length - 1) {
    // If already top tier (Villa / Penthouse), suggest private experience upgrade
    return {
      type: 'experience',
      title: 'Helipad & Yacht Transfer Package',
      description: 'Upgrade your stay with private helipad arrival and luxury catamaran sunset cruise.',
      discount: '15% Off VIP Package',
      additionalPrice: 250,
      targetRoom: currentRoom,
      perks: ['Private Helipad Access', 'Sunset Catamaran Cruise', '24/7 Butler Service']
    };
  }

  // Find next higher tier room that is Available
  const higherTierCategory = roomHierarchy[currentIndex + 1];
  const targetRoom = allRooms.find(
    (r) => r.category === higherTierCategory && r.status === 'Available'
  ) || allRooms.find((r) => roomHierarchy.indexOf(r.category) > currentIndex);

  if (!targetRoom) return null;

  const priceDiff = Math.max(50, targetRoom.price - currentRoom.price);

  return {
    type: 'room_upgrade',
    title: `Upgrade to ${targetRoom.name}`,
    description: `Enhance your stay experience from ${currentRoom.category} to ${targetRoom.category}.`,
    currentCategory: currentRoom.category,
    targetCategory: targetRoom.category,
    targetRoom: targetRoom,
    priceDiff: priceDiff,
    originalPrice: targetRoom.price,
    discountedPrice: Math.round(targetRoom.price * 0.85),
    perks: targetRoom.amenities ? targetRoom.amenities.slice(0, 3) : ['Ocean View', 'Complimentary Breakfast', 'Late Check-out']
  };
};

/**
 * Generates food & wine pairing recommendations based on guest order history or selected dish
 */
export const getFoodRecommendations = (selectedDish, fullMenu) => {
  if (!selectedDish || !fullMenu || fullMenu.length === 0) {
    // Fallback recommendation
    const chefSpecial = fullMenu.find((item) => item.tags && item.tags.includes('Chef Signature')) || fullMenu[0];
    return {
      title: 'Chef Special Recommendation',
      suggestedItem: chefSpecial,
      reason: 'Pairs excellently with fine dining experiences',
      discount: '10% Off Sommelier Choice'
    };
  }

  // Pairing Logic Rules
  let targetCategory = 'Beverages & Wine';
  let reason = 'Sommelier Pairing Recommendation';

  if (selectedDish.category === 'Fine Dining' || selectedDish.category === 'Main Course') {
    targetCategory = 'Beverages & Wine';
    reason = 'Complements your savory main course with refined notes';
  } else if (selectedDish.category === 'Breakfast') {
    targetCategory = 'Beverages & Wine';
    reason = 'Fresh cold-pressed energy boost for your breakfast stay';
  } else if (selectedDish.category === 'Beverages & Wine') {
    targetCategory = 'Desserts';
    reason = 'Sweet Artisanal soufflé to pair with your wine selection';
  }

  const suggestedItem = fullMenu.find(
    (item) => item.category === targetCategory && item.id !== selectedDish.id
  ) || fullMenu.find((item) => item.id !== selectedDish.id);

  return {
    title: `Recommended Pairing for ${selectedDish.name}`,
    suggestedItem,
    reason,
    discount: 'Special 15% Combo Discount'
  };
};
