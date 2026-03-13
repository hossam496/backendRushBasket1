import express from 'express'
import webpush from 'web-push'
import Subscription from '../models/subscription.models.js'

const router = express.Router()

// إعداد مفاتيح الـ VAPID من ملف الـ .env مباشرة لضمان الأمان وتجنب أخطاء الملفات
webpush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:albasuonyh@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

// إرجاع المفتاح العام للـ Frontend عشان يعمل Subscribe
router.get('/public-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY })
})

router.post('/subscribe', async (req, res) => {
  try {
    const { endpoint, keys } = req.body
    const userEmail = req.body.userEmail || null

    if (!endpoint || !keys) {
      return res.status(400).json({ message: 'Invalid subscription object' })
    }

    const existing = await Subscription.findOne({ endpoint })
    if (existing) {
      existing.keys = keys
      existing.userEmail = userEmail
      await existing.save()
    } else {
      await Subscription.create({ endpoint, keys, userEmail })
    }

    res.status(201).json({ message: 'Subscription stored' })
  } catch (err) {
    console.error('Error saving subscription', err)
    res.status(500).json({ message: 'Failed to save subscription' })
  }
})

router.post('/send', async (req, res) => {
  const { title, body, url, userEmail } = req.body

  try {
    const query = userEmail ? { userEmail } : {}
    const subs = await Subscription.find(query)

    const payload = JSON.stringify({
      title: title || 'Basket Notification',
      body: body || '',
      data: { url: url || '/' }
    })

    await Promise.all(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(sub, payload)
        } catch (err) {
          // لو الاشتراك انتهت صلاحيته (410) أو مش موجود (404)، نمسحه من قاعدة البيانات
          if (err.statusCode === 410 || err.statusCode === 404) {
            await Subscription.deleteOne({ _id: sub._id })
          } else {
            console.error('Push send error', err)
          }
        }
      })
    )

    res.json({ message: 'Notifications sent' })
  } catch (err) {
    console.error('Error sending push notifications', err)
    res.status(500).json({ message: 'Failed to send notifications' })
  }
})

export default router