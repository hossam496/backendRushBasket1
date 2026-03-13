import { Product } from "../models/product.models.js";

// get function to fetch products
export const getProducts = async (req, res, next) => {
    try {
        const products = await Product.find().sort({createdAt: -1})
        res.json(products)
    }
     catch (error) {
        next(error)
    }
} 

// create a product
export const createProduct = async (req, res, next) => {
    try {
        const filename = req.file?.filename ?? null
        const imageUrl = filename ? `/uploads/${filename}` : null
        const {name, description, category, oldPrice, price} = req.body

        const product = new Product({
            name,
            description,
            category,
            oldPrice: Number(oldPrice),
            price: Number(price),
            imageUrl
        })
        await product.save()
        res.status(201).json(product)
    }
     catch (err) {
        next(err)
    }
}

// delete a product
export const deleteProduct = async (req, res, next) => {
    try {
        const deleted = await Product.findByIdAndDelete(req.params.id)
        if(!deleted){
            res.status(404);
            throw new Error('Product not found')
        }
        res.json({message: 'Product Removed'})
    }
     catch (err) {
        next(err)
    }
}