const product = require("../model/Product.model.js")
const cloudinary = require("../config/cloudinary.js")

const getProducts = async(req,res)=>{
    try {
        const products = await product.find({})
        res.json(products)
    } catch (error) {
        res.status(401)
    }
}




const getProductbyId = async (req,res)=>{
    const {name} = req.body
    try {
        const specproduct = await product.findById(req.params.id)
        if(specproduct){
            res.json(specproduct)
        }else{
            res.status(500).json({
                message:"Product not found"
            })
        }
    } catch (error) {
        res.status(500).json({message:"server error"})
    }
}




const createProduct = async(req,res)=>{
    try {
        const {pname,pdesc,price,category,stock} = req.body
        let imageUrl = ''
        if(req.file){
            const result = await cloudinary.uploader.upload(req.file.path)
            imageUrl = result.secure_url
        }
        const products = await product.create({
            pname,
            pdesc,
            price,
            category,
            stock,
            images:[imageUrl]
        })
        res.status(201).json(products)

    } catch (error) {
        res.status(500).json({
            message:`server error ${error}`
        })
    }
}

const updateProduct = async(req,res)=>{
    const {pname,pdesc,price,category,stock,images} = req.body
    try {
        const prod = await product.findById(req.params.id)
        if(prod){
            product.name = pname || prod.pname
            product.pdesc = pdesc || prod.pdesc
            product.price = price || prod.price
            product.category = category || prod.category
            product.stock = stock || prod.stock
            product.images = images || prod.images
            if(req.file){
                const result = await cloudinary.uploader.upload(req.file.path)
                imageUrl = result.secure_url
            }
        }else{
            res.status(400).json({
               message:"Product not found"
            })
        }
        const updateProduct = await product.save()
        res.json(updatedProduct)
        
    } catch (error) {
        res.status(500).json({
            message:"Server error"
        })
    }
}

const deleteProduct = async (req,res)=>{
    try {
   // Single database query, much faster
const deletedProduct = await product.findByIdAndDelete(req.params.id);

if (deletedProduct) {
    // Product existed and was successfully deleted
    res.status(200).json({ message: "Product deleted successfully", deletedProduct });
} else {
    // Product did not exist
    res.status(404).json({ message: "Product not found" });
}

    } catch (error) {
        res.status(500).json({
            message:"Server error"
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