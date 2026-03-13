import express from 'express'
import multer from 'multer'
import { createProduct, deleteProduct, getProducts } from '../controllers/product.controller.js'




const itemrouter = express.Router()

// multer setup
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, 'uploads/'),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
})
const upload = multer({storage})

// routes
itemrouter.get('/', getProducts)
itemrouter.post('/', upload.single('image'), createProduct)
itemrouter.delete('/:id', deleteProduct)

export default itemrouter