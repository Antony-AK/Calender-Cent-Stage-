const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const Event = require("./models/Event");

dotenv.config();

const app = express();
app.use(express.json());

// CORS Configuration
const allowedOrigins = [
  "https://calender-cent-stage-uxvr.vercel.app",
  "http://localhost:5173"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// MongoDB Connection
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB Error:", err);
});

// Default Route for /
app.get("/", (req, res) => {
  res.send("✅ Backend is running! API is working fine.");
});

// Create Event
app.post("/events", async (req, res) => {
  try {
    const { title, category, start, end, color } = req.body;

    if (!title || !category || !start || !end) {
      return res.status(400).json({ error: "All fields (title, category, start, end) are required." });
    }

    const newEvent = new Event({
      title,
      category,
      start: new Date(start),
      end: new Date(end),
      color,
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

// Get All Events
app.get("/events", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

// Update Event
app.put("/events/:id", async (req, res) => {
  try {
    const { title, category, start, end, color } = req.body;

    if (!title || !category || !start || !end) {
      return res.status(400).json({ error: "All fields (title, category, start, end) are required." });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { title, category, start: new Date(start), end: new Date(end), color },
      { new: true }
    );

    if (!updatedEvent) return res.status(404).json({ error: "Event not found" });

    res.json(updatedEvent);
  } catch (err) {
    console.error("Error updating event:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

// Delete Event
app.delete("/events/:id", async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) return res.status(404).json({ error: "Event not found" });

    res.json({ message: "✅ Event deleted successfully" });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

// Server Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
