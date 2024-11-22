// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const amqplib = require('amqplib'); // RabbitMQ library
const User = require('./userModel'); // Import the user model
require('dotenv').config(); // Load environment variables

const app = express();
app.use(cors());
app.use(bodyParser.json()); // Parse JSON payloads

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// RabbitMQ Connection Setup
let channel;
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq:5672"; // RabbitMQ URL
const EXCHANGE_NAME = "user_events";

const connectRabbitMQ = async () => {
  try {
    const connection = await amqplib.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: true });
    console.log("Connected to RabbitMQ");
  } catch (error) {
    console.error("Failed to connect to RabbitMQ:", error);
  }
};

// Helper to publish messages to RabbitMQ
const publishEvent = async (routingKey, message) => {
  if (!channel) return console.error("RabbitMQ channel not initialized");
  channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(JSON.stringify(message)));
};

// API Endpoints

/**
 * Register a new user
 */
app.post('/register', async (req, res) => {
  const { name, email, password, preferences } = req.body;
  try {
    const newUser = new User({
      name,
      email,
      password,
      preferences: preferences || { news: [], technology: [] }
    });

    await newUser.save();

    // Publish an event to RabbitMQ
    publishEvent("user.created", { userId: newUser._id, email: newUser.email });

    res.status(201).send({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    if (error.code === 11000) { // Handle duplicate email error
      res.status(400).send({ message: 'Email already exists' });
    } else {
      res.status(500).send({ message: 'Error registering user', error: error.message });
    }
  }
});

/**
 * Login a user
 */
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).send({ message: 'Invalid email or password' });
    }

    // Exclude the password from the response
    const { password: _, ...userData } = user.toObject();

    // Publish a login event
    publishEvent("user.logged_in", { userId: user._id, email: user.email });

    res.send({ message: 'Login successful', user: userData });
  } catch (error) {
    res.status(500).send({ message: 'Error logging in', error: error.message });
  }
});

/**
 * Update preferences of a user
 */
app.put('/preferences', async (req, res) => {
  const { userId, preferences } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { preferences },
      { new: true } // Return the updated document
    );
    if (!updatedUser) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Publish a preferences updated event
    publishEvent("user.preferences_updated", { userId: updatedUser._id, preferences });

    res.send({ message: 'Preferences updated successfully', preferences: updatedUser.preferences });
  } catch (error) {
    res.status(500).send({ message: 'Error updating preferences', error: error.message });
  }
});

/**
 * Get preferences of a user
 */
app.get('/preferences', async (req, res) => {
  const { userId } = req.query;
  try {
    const user = await User.findById(userId);
    if (user) {
      res.send(user.preferences);
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Error fetching preferences', error: error.message });
  }
});

/**
 * Get user email by user ID
 */
app.get('/user/email', async (req, res) => {
  const { userId } = req.query;
  try {
    const user = await User.findById(userId);
    if (user) {
      res.json({ email: user.email });
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Error fetching user email', error: error.message });
  }
});

// Start the server
const port = process.env.PORT || 3001;
app.listen(port, async () => {
  console.log(`User Service listening on port ${port}`);
  await connectRabbitMQ(); // Connect to RabbitMQ when the server starts
});
