const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    color: { type: String, default: "blue" }
    
});

module.exports = mongoose.model("Event", eventSchema);
