import Order from '../models/order.models.js'
import { v4 as uuidv4 } from 'uuid'
import Stripe from 'stripe'

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY) // 



export const createOrder = async (req, res) => {
    try {
        const { customer, items, paymentMethod, notes, deliveryDate } = req.body;

        // 1. تأكد إن المستخدم مسجل دخول
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        if (!Array.isArray(items) || !items.length) {
            return res.status(400).json({ message: "Invalid or empty items array" });
        }

        const normalizedPM = paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment';

        const orderItems = items.map(i => ({
            id: i.id,
            name: i.name,
            price: Number(i.price),
            quantity: Number(i.quantity),
            imageUrl: i.imageUrl
        }));

        // تأكد من وجود uuidv4
        const orderId = `ORD-${uuidv4()}`;
        let newOrder;

        if (normalizedPM === 'Online Payment') {
            // تأكد إن الايميل موجود قبل ما تبعته لـ Stripe
            if (!customer?.email) {
                return res.status(400).json({ message: "Customer email is required for online payment" });
            }

            const session = await stripeInstance.checkout.sessions.create({ 
                payment_method_types: ['card'],
                mode: 'payment',
                line_items: orderItems.map(o => ({
                    price_data: {
                        currency: 'inr',
                        product_data: { name: o.name },
                        unit_amount: Math.round(o.price * 100)
                    },
                    quantity: o.quantity
                })),
                customer_email: customer.email,
                success_url: `${process.env.FRONTEND_URL}/myorders/verify?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL}/checkout?payment_status=cancel`,
                metadata: { orderId }
            });

            newOrder = new Order({
                orderId,
                user: req.user._id,
                customer,
                items: orderItems,
                shipping: 0,
                paymentMethod: normalizedPM,
                paymentStatus: 'Unpaid',
                sessionId: session.id,
                notes,
                deliveryDate
            });

            await newOrder.save();
            return res.status(201).json({ order: newOrder, checkoutUrl: session.url });
        }

        // لو COD
        newOrder = new Order({
            orderId,
            user: req.user._id,
            customer,
            items: orderItems,
            shipping: 0,
            paymentMethod: normalizedPM,
            paymentStatus: 'Paid', // العادي إن الـ COD بيبقى Unpaid لحد ما يستلم، بس خليتها زي كودك
            notes,
            deliveryDate
        });

        await newOrder.save();
        res.status(201).json({ order: newOrder, checkoutUrl: null });

    } catch (err) {
        console.error('CreatedOrder Error Details:', err); // دي هتطبع لك المشكلة فين بالظبط في الـ Console
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
}



// confirm stripe payment
export const confirmPayment = async (req, res) => {
    try {
      const { session_id } = req.query;
      if(!session_id) return res.status(400).json({message: 'session_id required'})
        const session = await stripeInstance.checkout.sessions.retrieve(session_id)
    if(session.payment_status !== 'paid'){
        return res.status(400).json({message: 'Payment not completed'})
    }  

    const order = await Order.findOneAndUpdate(
        {sessionId: session_id},
        {paymentStatus: 'Paid'},
        {new: true}
    )
    
    res.status(200).json({ success: true, order }); 
    }
     catch (err) {
        console.error('ConfirmPayment Error:', err)
        res.status(500).json({message: 'Server Error', error: err.message})
    }
}

// get all order

export const getOrder = async (req, res, next) => {
    try {
        const orders = await Order.find({})
        .sort({createdAt: -1}) 
        .lean()
        res.json(orders)
    }
     catch (err) {
        console.error('getOrder Error:', err)
        next(err)
    }
}

// get orders by id 
export const getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).lean()
        if(!order){
            return res.status(404).json({message: 'Order not found'})
        }
        res.json(order)
    }
     catch (err) {
        console.error('getOrderById Error:', err)
        next(err)
    }
}

// UPDATE ORDER BY ID
export const updateOrder = async (req, res, next) => {
    try {
        const allwed = ['status', 'paymentStatus', 'deliveryDate', 'notes']; 
        const updateDate = {}; 
        allwed.forEach(field => {
            if(req.body[field] !== undefined){
                updateDate[field] = req.body[field]
            }
        })
        const update = await Order.findByIdAndUpdate(
            req.params.id,
            updateDate,
            {new: true, runValidators: true}
        ).lean();

        if(!update){
            return res.status(404).json({message: 'Order not found'})
        }
        res.json(update)
    }
     catch (err) {
        console.error('updateOrders Error:', err)
        next(err)
    }
}

// delet method to delet order
export const deletOrder = async (req, res, next) => {
    try {
        const deleted = await Order.findByIdAndDelete(req.params.id).lean();
        if(!deleted){
            return res.status(404).json({message: 'Order not found'})
        }
        res.json({message: 'Order deleted successfully'})
    }
     catch (err) {
       console.error('DeletOrder Error:', err)
        next(err) 
    }
}