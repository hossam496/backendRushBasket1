import express from 'express'
import cors from 'cors'

import 'dotenv/config'
import { connectDB } from './config/db.js'

import path from 'path'
import { fileURLToPath } from 'url'

import userRouter from './routes/user.routes.js'
import itemrouter from './routes/product.routes.js'
import authMiddleware from './middleware/auth.middleware.js'
import cartRouter from './routes/cart.routes.js'
import orderrouter from './routes/order.routes.js'
import notificationRouter from './routes/notification.routes.js'

const app = express()
const port = process.env.PORT || 4000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// middleware
app.use(cors({
    origin: (origin, callback) => {
        // التعديل هنا للسماح بكلا المنفذين
        const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174']; 
        if(!origin || allowedOrigins.includes(origin)){
            callback(null, true)
        }
        else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())
app.use(express.urlencoded({extended: true}))

connectDB()

// routes
app.use('/api/user', userRouter)
app.use('/api/cart', authMiddleware, cartRouter)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/items', itemrouter)
app.use('/api/orders', orderrouter)
app.use('/api/notifications', notificationRouter)

app.get('/', (req, res) => {
    res.send('API WARKING')
})

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`)
})