require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3003;

// In-memory storage for development (replace with MongoDB later)
const users = [];
const tokens = new Map();

// Middleware
app.use(cors());
app.use(express.json());

// Simple JWT-like token generation
const generateToken = (userId) => {
  return `token_${userId}_${Date.now()}`;
};

// Simple password hashing (replace with bcrypt later)
const hashPassword = (password) => {
  return `hashed_${password}_${Date.now()}`;
};

// Simple password comparison
const comparePassword = (hashedPassword, password) => {
  return hashedPassword.includes(password);
};

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Exam Pathfinder API" });
});

// Auth routes
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = users.find(user => 
      user.email === email || user.username === username
    );
    
    if (existingUser) {
      return res.status(400).json({ 
        message: "User with this email or username already exists" 
      });
    }
    
    // Create new user
    const newUser = {
      id: `user_${Date.now()}`,
      username,
      email,
      password: hashPassword(password),
      createdAt: new Date()
    };
    
    users.push(newUser);
    
    // Generate token
    const token = generateToken(newUser.id);
    tokens.set(token, newUser.id);
    
    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    // Check password
    if (!comparePassword(user.password, password)) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    // Generate token
    const token = generateToken(user.id);
    tokens.set(token, user.id);
    
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Reviews routes (placeholder)
app.get("/api/reviews/channel/:channelId", (req, res) => {
  res.json({ reviews: [] });
});

app.post("/api/reviews", (req, res) => {
  res.json({ message: "Review added successfully" });
});

// Feedback routes (placeholder)
app.post("/api/feedback", (req, res) => {
  res.json({ message: "Feedback submitted successfully" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log("Using in-memory database for development");
});