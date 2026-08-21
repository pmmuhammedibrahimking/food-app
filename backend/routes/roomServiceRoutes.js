import express from 'express';
import {
  getMenu,
  getAllOrders,
  createOrder,
  updateOrderStatus
} from '../models/roomServiceModel.js';

export const createRoomServiceRouter = (io) => {
  const router = express.Router();

  // Get Room Service Menu
  router.get('/menu', (req, res) => {
    res.json(getMenu());
  });

  // Get All Orders
  router.get('/orders', (req, res) => {
    res.json(getAllOrders());
  });

  // Create Room Service Order
  router.post('/orders', (req, res) => {
    const { roomNumber, guestName, items, specialInstructions, totalAmount } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    const newOrder = createOrder({
      roomNumber,
      guestName,
      items,
      specialInstructions,
      totalAmount
    });

    const notification = {
      id: `NOTIF-${Date.now()}`,
      title: 'New Room Service Order Received',
      message: `Room ${newOrder.roomNumber} (${newOrder.guestName}) ordered ${newOrder.items.length} item(s). Total: $${newOrder.totalAmount}`,
      type: 'order_created',
      timestamp: new Date().toISOString(),
      orderId: newOrder.id,
      roomNumber: newOrder.roomNumber
    };

    // Emit Socket.io Real-Time Events
    if (io) {
      io.emit('room_service_order_created', newOrder);
      io.emit('notification', notification);
    }

    res.status(201).json({ success: true, order: newOrder, notification });
  });

  // Update Order Status (Preparing -> Delivered)
  router.put('/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Preparing', 'Delivered'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be "Preparing" or "Delivered"' });
    }

    const updatedOrder = updateOrderStatus(id, status);
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const notification = {
      id: `NOTIF-${Date.now()}`,
      title: `Order Status Updated: ${status}`,
      message: `Order #${updatedOrder.id} for Room ${updatedOrder.roomNumber} is now ${status}.`,
      type: 'status_updated',
      timestamp: new Date().toISOString(),
      orderId: updatedOrder.id,
      status: updatedOrder.status,
      roomNumber: updatedOrder.roomNumber
    };

    if (io) {
      io.emit('room_service_order_updated', updatedOrder);
      io.emit('notification', notification);
    }

    res.json({ success: true, order: updatedOrder, notification });
  });

  return router;
};
