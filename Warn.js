const mongoose = require("mongoose");

const warnSchema = new mongoose.Schema({
  guildId: String,
  userId: String,
  warns: [
    {
      modId: String,
      reason: String,
      time: Number
    }
  ]
});

module.exports = mongoose.model("Warn", warnSchema);