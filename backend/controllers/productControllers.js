const product = require("../model/Product.model.js")
const cloudinary = require("../config/cloudinary.js")

// Get all products
const getProducts = async (req, res) => {
    try {
        const products = await product.find({})
        res.json(products)
    } catch (error) {
        res.status(500).json({ message: "Error fetching products", error: error.message })
    }
}

// Get single product by ID (no req.body dependency on GET)
const getProductbyId = async (req, res) => {
    try {
        const specproduct = await product.findById(req.params.id)
        if (specproduct) {
            res.json(specproduct)
        } else {
            res.status(404).json({
                message: "Product not found"
            })
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message })
    }
}

// Create new product (Admin only)
const createProduct = async (req, res) => {
    try {
        const { pname, pdesc, price, category, stock } = req.body
        let imageUrl = ''
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path)
            imageUrl = result.secure_url
        }
        const createdProduct = await product.create({
            pname,
            pdesc,
            price: Number(price),
            category,
            stock: Number(stock),
            images: imageUrl ? [imageUrl] : []
        })
        res.status(201).json(createdProduct)

    } catch (error) {
        res.status(500).json({
            message: `Server error: ${error.message}`
        })
    }
}

// Update existing product (Admin only)
const updateProduct = async (req, res) => {
    const { pname, pdesc, price, category, stock, images } = req.body
    try {
        const prod = await product.findById(req.params.id)
        if (!prod) {
            return res.status(404).json({
                message: "Product not found"
            })
        }

        if (pname) prod.pname = pname
        if (pdesc) prod.pdesc = pdesc
        if (price !== undefined) prod.price = Number(price)
        if (category) prod.category = category
        if (stock !== undefined) prod.stock = Number(stock)
        if (images) prod.images = Array.isArray(images) ? images : [images]

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path)
            prod.images = [result.secure_url]
        }

        const updatedProduct = await prod.save()
        return res.json(updatedProduct)

    } catch (error) {
        return res.status(500).json({
            message: "Server error updating product",
            error: error.message
        })
    }
}

// Delete product by ID (Admin only)
const deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await product.findByIdAndDelete(req.params.id)
        if (deletedProduct) {
            res.status(200).json({ message: "Product deleted successfully", deletedProduct })
        } else {
            res.status(404).json({ message: "Product not found" })
        }
    } catch (error) {
        res.status(500).json({
            message: "Server error deleting product",
            error: error.message
        })
    }
}

module.exports = {
    getProducts,
    getProductbyId,
    createProduct,
    updateProduct,
    deleteProduct
}