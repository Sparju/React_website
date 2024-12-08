const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // For environment variables

const app = express();
const port = 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend URL
  credentials: true,
}));
app.use(express.json()); // Parse JSON bodies

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/app_project')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Model
const userSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  dob: { type: Date },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// API Endpoints
// 1. Fetch all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ status: 'failure', message: error.message });
  }
});

// 2. Register a new user
app.post('/api/users', async (req, res) => {
  const { userName, email, dob, password, phoneNumber } = req.body;

  if (!userName || !email || !password || !phoneNumber) {
    return res.status(400).send({ message: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ userName, email, dob, password: hashedPassword, phoneNumber });

    await newUser.save();
    res.status(201).send({ status: 'success', message: 'User registered successfully!', user: newUser });
  } catch (error) {
    res.status(500).json({ status: 'failure', message: error.message });
  }
});

// 3. Login and authenticate user
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';
app.post('/api/auth', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ status: 'failure', message: 'All fields are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ status: 'failure', message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send({ status: 'failure', message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
    res.status(200).send({ status: 'success', message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ status: 'failure', message: error.message });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
