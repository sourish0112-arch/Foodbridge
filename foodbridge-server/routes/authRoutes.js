const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const protect = require('../middleware/authMiddleware');

// REGISTER
router.post('/register', async (req, res) => {
  const { name, email, password, role, location, dietaryPrefs, phoneNumber, websiteLink } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10); // encrypt password
    const user = await User.create({ name, email, password: hashed, role, location, dietaryPrefs, phoneNumber, websiteLink });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, phoneNumber: user.phoneNumber, websiteLink: user.websiteLink, location: user.location, dietaryPrefs: user.dietaryPrefs } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Wrong password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, phoneNumber: user.phoneNumber, websiteLink: user.websiteLink, location: user.location, dietaryPrefs: user.dietaryPrefs } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/me', protect(), async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.email) updates.email = req.body.email;
    if (req.body.phoneNumber !== undefined) updates.phoneNumber = req.body.phoneNumber;
    if (req.body.websiteLink !== undefined) updates.websiteLink = req.body.websiteLink;
    if (req.body.location) updates.location = req.body.location;
    if (req.body.password) updates.password = await bcrypt.hash(req.body.password, 10);

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;