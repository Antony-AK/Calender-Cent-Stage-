const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema({
    title: { type: String, required: true },
    color: { type: String, default: "gray" },
    events: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }] 
});

module.exports = mongoose.model("Goal", goalSchema);
