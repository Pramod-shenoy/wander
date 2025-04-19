const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");
require('dotenv').config();

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wander";

async function createDefaultUser() {
  try {
    // First check if the user already exists
    let user = await User.findOne({ username: "Pramod" });
    if (!user) {
      // Create a new user using passport-local-mongoose
      user = await User.register(
        new User({ email: "pramod@example.com", username: "Pramod" }),
        "pramod123"
      );
    }
    return user._id;
  } catch (err) {
    console.error("Error creating default user:", err);
    throw err;
  }
}

async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to DB");
    
    // Create default user and get their ID
    const userId = await createDefaultUser();
    console.log("Default user created/found");

    // Initialize listings with the user ID
    await initDB(userId);
    
    console.log("All initialization completed successfully");
    process.exit(0);
  } catch (err) {
    console.error("Error in main:", err);
    process.exit(1);
  }
}

const initDB = async (userId) => {
  try {
    await Listing.deleteMany({});
    const listings = initData.data.map((obj) => ({
      ...obj,
      owner: userId
    }));
    await Listing.insertMany(listings);
    console.log("Data was initialized");
  } catch (err) {
    console.error("Error initializing database:", err);
    throw err;
  }
};

main();