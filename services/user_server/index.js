const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./userModel'); // Import the user model
require('dotenv').config(); // Load environment variables

const app = express();
app.use(bodyParser.json()); // For parsing application/json
console.log(process.env.MONGO_URI);
// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000, // מקסימום זמן המתנה לחיבור
  socketTimeoutMS: 45000, // זמן מקסימלי לפעולת socket
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Endpoint to register new user
app.post('/register', async (req, res) => {
  const { name, email, password, preferences } = req.body;
  try {
    const newUser = new User({ name, email, password, preferences });
    await newUser.save();
    console.log(newUser);
    res.status(201).send(newUser);
  } catch (error) {
    res.status(500).send('Error registering user: ' + error.message);
  }
});

// Endpoint to login user
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).send('Invalid credentials');
    }
    res.send(user);
  } catch (error) {
    res.status(500).send('Error logging in: ' + error.message);
  }
});

// Endpoint to get preferences of a user
app.get('/preferences', async (req, res) => {
  const { userId } = req.query;
  try {
    const user = await User.findById(userId);
    if (user) {
      res.send(user.preferences);
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    res.status(500).send('Error fetching preferences: ' + error.message);
  }
});

// Endpoint to update preferences of a user
app.put('/preferences', async (req, res) => {
  const { userId, preferences } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, { preferences }, { new: true });
    res.send(updatedUser.preferences);
  } catch (error) {
    res.status(500).send('Error updating preferences: ' + error.message);
  }
});

// Endpoint to get user email by userId
app.get('/user/email', async (req, res) => {
  const { userId } = req.query;
  try {
    const user = await User.findById(userId);
    if (user) {
      res.json({ email: user.email });
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    res.status(500).send('Error fetching user email: ' + error.message);
  }
});

// Start the server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`User Service listening on port ${port}`);
});
