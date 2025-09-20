const express = require("express");
const Review = require("../models/Review");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all reviews for a channel
router.get("/channel/:channelId", async (req, res) => {
  try {
    const { channelId } = req.params;
    const reviews = await Review.find({ channelId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Add a review for a channel
router.post("/", auth, async (req, res) => {
  try {
    const { channelId, channelName, rating, comment } = req.body;
    
    // Check if user already reviewed this channel
    const existingReview = await Review.findOne({ 
      channelId, 
      userId: req.user._id 
    });
    
    if (existingReview) {
      return res.status(400).json({ 
        message: "You have already reviewed this channel" 
      });
    }
    
    // Create new review
    const review = new Review({
      channelId,
      channelName,
      userId: req.user._id,
      username: req.user.username,
      rating,
      comment
    });
    
    await review.save();
    
    res.status(201).json({
      message: "Review added successfully",
      review
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update a review
router.put("/:id", auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    
    review.rating = rating;
    review.comment = comment;
    await review.save();
    
    res.json({
      message: "Review updated successfully",
      review
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete a review
router.delete("/:id", auth, async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;