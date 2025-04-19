const mongoose = require("mongoose");
const User = require("./models/user.js");
require('dotenv').config();

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wander";

async function createAdmin() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to DB");

        // Check if admin user exists
        let admin = await User.findOne({ username: "admin" });
        if (!admin) {
            admin = await User.register(
                new User({ email: "admin@example.com", username: "admin" }),
                "admin123"
            );
            console.log("Admin user created successfully");
        } else {
            console.log("Admin user already exists");
        }
        
        process.exit(0);
    } catch (err) {
        console.error("Error creating admin user:", err);
        process.exit(1);
    }
}

createAdmin(); 