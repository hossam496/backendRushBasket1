import mongoose from 'mongoose'

const subscriptionSchema = new mongoose.Schema(
  {
    endpoint: { type: String, required: true, unique: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true }
    },
    userEmail: { type: String },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
)

const Subscription = mongoose.model('Subscription', subscriptionSchema)

export default Subscription

