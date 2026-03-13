import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import { addToCart, clearCart, deleteCartItem, getCart, updateCartItem } from '../controllers/cart.controller.js';



const cartRouter = express.Router()
cartRouter.use(authMiddleware)

cartRouter.get('/', getCart)
cartRouter.post('/', addToCart)
cartRouter.post('/add', addToCart)
cartRouter.put('/:id', updateCartItem)
cartRouter.delete('/:id', deleteCartItem)
cartRouter.post('/clear', clearCart)

export default cartRouter