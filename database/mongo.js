const mongoose = require("mongoose");

module.exports = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.log("⚠️ Mongo URI not found in environment variables");
      return;
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
};
