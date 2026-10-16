const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
    pname:{
        type:String,
        required:true
    },
    pdesc:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true   
    },
    category:{
        type: String,
        required:true
    },
    stock:{
        type:Number,
        required:true
    },
    images:[{
        type:String
    }],
    createdAt:{
        type:Date,
        default:Date.now
    },
    ratings:{
        type:Number,
        default:0
    },
    numreviews:{
        type:Number,
        default:0
    }
})

// Register both "Product" and "product" to support Order.items.productId ref:'Product'
const ProductModel = mongoose.models.Product || mongoose.model("Product", productSchema)
try {
    if (!mongoose.models.product) {
        mongoose.model("product", productSchema)
    }
} catch (e) {
    // ignore
}

module.exports = ProductModel