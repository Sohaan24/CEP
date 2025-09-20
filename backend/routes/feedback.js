const express = require("express");
const Feedback = require("../models/Feedback");
const auth = require("../middleware/auth");

const router = express.Router();

// Submit feedback
router.post("/", async (req, res) => {
  try {
    const { rating, feedback, category, email, username } = req.body;
    
    // Create feedback object
    const feedbackData = {
      rating,
      feedback,
      category
    };
    
    // Add user info if user is authenticated
    if (req.user) {
      feedbackData.userId = req.user._id;
      feedbackData.username = req.user.username;
    } else if (email || username) {
      // For anonymous feedback
      feedbackData.email = email;
      feedbackData.username = username;
    }
    
    const newFeedback = new Feedback(feedbackData);
    await newFeedback.save();
    
    res.status(201).json({
      message: "Feedback submitted successfully",
      feedback: newFeedback
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get all feedback (admin only)
router.get("/", auth, async (req, res) => {
  try {
    // In a real app, you would check if user is admin
    // For now, we'll just return all feedback
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;