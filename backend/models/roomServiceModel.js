// Real-Time In-Memory Store for Room Service Menu & Orders

export const roomServiceMenu = [
  {
    id: 'MENU-101',
    name: 'Australian Wagyu Ribeye Steak',
    category: 'Fine Dining',
    price: 185,
    description: 'Grade M9+ Wagyu served with truffle potato purée & red wine jus',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    tags: ['Chef Signature', 'Gluten Free']
  },
  {
    id: 'MENU-102',
    name: 'Vintage Dom Pérignon Champagne',
    category: 'Beverages & Wine',
    price: 450,
    description: '2012 Vintage Cuvée, chilled and served with crystal flutes',
    image: 'https://images.unsplash.com/photo-1569919659476-f0852f6834b7?auto=format&fit=crop&w=800&q=80',
    tags: ['Luxury Wine', 'Chilled']
  },
  {
    id: 'MENU-103',
    name: 'Artisanal Truffle Omelette',
    category: 'Breakfast',
    price: 45,
    description: 'Organic eggs, shaved black winter truffle, gruyère cheese & brioche',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
    tags: ['Breakfast Classic', 'Organic']
  },
  {
    id: 'MENU-104',
    name: 'Pan-Seared Chilean Sea Bass',
    category: 'Main Course',
    price: 92,
    description: 'Served over lemongrass risotto and saffron emulsion sauce',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
    tags: ['Seafood', 'Chef Special']
  },
  {
    id: 'MENU-105',
    name: 'Valrhona Dark Chocolate Soufflé',
    category: 'Desserts',
    price: 32,
    description: 'Warm 70% dark chocolate soufflé with Madagascar vanilla bean gelato',
    image: 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=800&q=80',
    tags: ['Dessert', 'Freshly Baked']
  },
  {
    id: 'MENU-106',
    name: 'Fresh Detox Green Cold-Pressed Juice',
    category: 'Beverages & Wine',
    price: 24,
    description: 'Green apple, celery, cucumber, ginger & organic kale juice',
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80',
    tags: ['Healthy', 'Vegan']
  }
];

export const roomServiceOrders = [
  {
    id: 'ORD-501',
    roomNumber: '401',
    guestName: 'Lord Alexander Wright',
    items: [
      { name: 'Australian Wagyu Ribeye Steak', quantity: 2, price: 185 },
      { name: 'Vintage Dom Pérignon Champagne', quantity: 1, price: 450 }
    ],
    specialInstructions: 'Medium rare for the steak please. Extra champagne flutes.',
    totalAmount: 820,
    status: 'Preparing',
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
    time: '18:30'
  },
  {
    id: 'ORD-502',
    roomNumber: '101',
    guestName: 'Sophia Loren',
    items: [
      { name: 'Artisanal Truffle Omelette', quantity: 1, price: 45 },
      { name: 'Fresh Detox Green Cold-Pressed Juice', quantity: 1, price: 24 }
    ],
    specialInstructions: 'No butter on brioche.',
    totalAmount: 69,
    status: 'Delivered',
    createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
    time: '17:15'
  }
];

export const getMenu = () => roomServiceMenu;

export const getAllOrders = () => roomServiceOrders;

export const createOrder = (orderData) => {
  const newOrder = {
    id: `ORD-${Math.floor(100 + Math.random() * 900)}`,
    roomNumber: orderData.roomNumber || '101',
    guestName: orderData.guestName || 'Resort Guest',
    items: orderData.items || [],
    specialInstructions: orderData.specialInstructions || '',
    totalAmount: orderData.totalAmount || 0,
    status: 'Preparing',
    createdAt: new Date().toISOString(),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  roomServiceOrders.unshift(newOrder);
  return newOrder;
};

export const updateOrderStatus = (id, newStatus) => {
  const orderIndex = roomServiceOrders.findIndex((o) => o.id === id);
  if (orderIndex === -1) return null;

  roomServiceOrders[orderIndex] = {
    ...roomServiceOrders[orderIndex],
    status: newStatus,
    updatedAt: new Date().toISOString()
  };

  return roomServiceOrders[orderIndex];
};
