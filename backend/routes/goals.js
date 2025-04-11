const express = require("express");
const Goal = require("../models/Goal");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const goals = await Goal.find().populate("events"); 
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

const Event = require("../models/Event");

router.post("/", async (req, res) => {
  try {
    console.log("Received Body:", req.body);
    const { title, color, events } = req.body;

    const validEvents = await Event.find({ _id: { $in: events } });
    if (validEvents.length !== events.length) {
      return res.status(400).json({ error: "Some referenced events do not exist" });
    }

    const newGoal = new Goal({ title, color, events });
    await newGoal.save();
    res.status(201).json(newGoal);
  } catch (error) {
    console.error("Failed to add goal:", error);
    res.status(400).json({ error: "Failed to add goal", details: error.message });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id).populate("events");
    if (!goal) return res.status(404).json({ error: "Goal not found" });
    res.json(goal);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id/add-event", async (req, res) => {
    try {
      const { eventId } = req.body;
      

      const eventExists = await Event.findById(eventId);
      if (!eventExists) return res.status(404).json({ error: "Event not found" });
  
      const updatedGoal = await Goal.findByIdAndUpdate(
        req.params.id,
        { $addToSet: { events: eventId } }, 
        { new: true }
      ).populate("events");
  
      if (!updatedGoal) return res.status(404).json({ error: "Goal not found" });
  
      res.json(updatedGoal);
    } catch (error) {
      res.status(500).json({ error: "Server error", details: error.message });
    }
  });

  
  

module.exports = router;
