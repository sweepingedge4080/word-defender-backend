const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB error:', err));

// User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bestScore: { type: Number, default: 0 }
});

const User = mongoose.model('User', UserSchema);

// API Routes
app.post('/api/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }
    const user = new User({ username, password });
    await user.save();
    res.json({ username: user.username, bestScore: user.bestScore });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }
    res.json({ username: user.username, bestScore: user.bestScore });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/update-score', async (req, res) => {
  try {
    const { username, score } = req.body;
    const user = await User.findOne({ username });
    if (score > user.bestScore) {
      user.bestScore = score;
      await user.save();
    }
    res.json({ bestScore: user.bestScore });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const topPlayers = await User.find()
      .sort({ bestScore: -1 })
      .limit(10)
      .select('username bestScore');
    res.json(topPlayers);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});