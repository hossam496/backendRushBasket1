import express from 'express'
import authMiddleware from '../middleware/auth.middleware.js';
import { confirmPayment, createOrder, deletOrder, getOrder, getOrderById, updateOrder } from '../controllers/order.controller.js';




const orderrouter = express.Router();

// PROTECTED ROUTES
orderrouter.post('/', authMiddleware, createOrder)
orderrouter.get('/confirm', authMiddleware, confirmPayment)

// PUPLIC ROUTES
orderrouter.get('/', getOrder);
orderrouter.get('/:id', getOrderById);
orderrouter.put('/:id', updateOrder);
orderrouter.delete('/:id', deletOrder)

export default orderrouter