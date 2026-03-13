import mongoose from 'mongoose'

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://hoss123:hoss123@cluster0.oarmfs8.mongodb.net/RushBasket')
    .then(() => console.log('DB CONNECTED'))
}