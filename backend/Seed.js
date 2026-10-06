const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("./model/User.model.js");
const Product = require("./model/Product.model.js");
const Order = require("./model/Order.model.js");

dotenv.config();

const seedData = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("❌ MONGO_URI is missing in .env file");
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("⚡ Connected to MongoDB...");

        // 1. Clear existing data
        console.log("🗑️ Clearing existing database collections...");
        await User.deleteMany();
        await Product.deleteMany();
        await Order.deleteMany();

        // 2. Prepare Sample Users
        console.log("👤 Generating users...");
        const salt = await bcrypt.genSalt(10);
        const adminPassword = await bcrypt.hash("Admin@123", salt);
        const userPassword = await bcrypt.hash("User@123", salt);

        const users = await User.insertMany([
            {
                name: "Admin User",
                email: "admin@buyez.com",
                password: adminPassword,
                role: "admin",
                verified: true
            },
            {
                name: "John Doe",
                email: "john@example.com",
                password: userPassword,
                role: "user",
                verified: true
            },
            {
                name: "Jane Smith",
                email: "jane@example.com",
                password: userPassword,
                role: "user",
                verified: true
            }
        ]);

        const normalUser1 = users[1];
        const normalUser2 = users[2];

        // 3. Prepare Sample Products
        console.log("📦 Generating products...");
        const products = await Product.insertMany([
            {
                pname: "Apple iPhone 15 Pro (128GB)",
                pdesc: "Titanium design, A17 Pro chip, 48MP main camera with customizable Action button and USB-C.",
                price: 119999,
                category: "Smartphones",
                stock: 25,
                images: [
                    "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80"
                ],
                ratings: 4.8,
                numreviews: 120
            },
            {
                pname: "Sony WH-1000XM5 Wireless Headphones",
                pdesc: "Industry-leading noise canceling with two processors, 8 microphones, and crystal clear hands-free calling.",
                price: 29990,
                category: "Audio",
                stock: 40,
                images: [
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80"
                ],
                ratings: 4.7,
                numreviews: 85
            },
            {
                pname: "Nike Air Max 270",
                pdesc: "Nike's first lifestyle Air Max brings you style, comfort, and big attitude with super-soft foam.",
                price: 13995,
                category: "Footwear",
                stock: 50,
                images: [
                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80"
                ],
                ratings: 4.5,
                numreviews: 64
            },
            {
                pname: "Samsung 55-inch 4K Smart TV",
                pdesc: "Crystal Processor 4K, HDR, Motion Xcelerator with Smart TV powered by Tizen OS.",
                price: 45990,
                category: "Electronics",
                stock: 15,
                images: [
                    "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80"
                ],
                ratings: 4.6,
                numreviews: 42
            },
            {
                pname: "Mechanical Gaming Keyboard RGB",
                pdesc: "Customizable per-key RGB backlighting, durable mechanical switches, and detachable USB-C cable.",
                price: 4999,
                category: "Accessories",
                stock: 60,
                images: [
                    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80"
                ],
                ratings: 4.4,
                numreviews: 30
            }
        ]);

        // 4. Prepare Sample Orders
        console.log("🛒 Generating sample orders...");
        await Order.insertMany([
            {
                user: normalUser1._id,
                items: [
                    {
                        productId: products[0]._id,
                        qty: 1,
                        price: products[0].price
                    },
                    {
                        productId: products[1]._id,
                        qty: 1,
                        price: products[1].price
                    }
                ],
                totalAmount: products[0].price + products[1].price,
                address: {
                    fullName: "John Doe",
                    street: "123 MG Road",
                    city: "Bengaluru",
                    postalcode: "560001",
                    country: "India"
                },
                paymentId: "pay_mock_12345678",
                status: "shipped"
            },
            {
                user: normalUser2._id,
                items: [
                    {
                        productId: products[2]._id,
                        qty: 2,
                        price: products[2].price
                    }
                ],
                totalAmount: products[2].price * 2,
                address: {
                    fullName: "Jane Smith",
                    street: "45 Marine Drive",
                    city: "Mumbai",
                    postalcode: "400020",
                    country: "India"
                },
                paymentId: "pay_mock_87654321",
                status: "pending"
            }
        ]);

        console.log("✅ Database seeded successfully!");
        console.log("-----------------------------------------");
        console.log("🔑 Sample Credentials:");
        console.log("   Admin : admin@buyez.com / Admin@123");
        console.log("   User 1: john@example.com / User@123");
        console.log("   User 2: jane@example.com / User@123");
        console.log("-----------------------------------------");

        process.exit(0);
    } catch (error) {
        console.error("❌ Error while seeding data:", error);
        process.exit(1);
    }
};

seedData();
