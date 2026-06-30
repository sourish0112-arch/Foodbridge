const express = require('express');
const router = express.Router();
const ImpactLog = require('../models/ImpactLog');
const User = require('../models/User');
const protect = require('../middleware/authMiddleware');

// City-wide stats
router.get('/stats', async (req, res) => {
  try {
    const logs = await ImpactLog.find();
    const totalKg = logs.reduce((s, l) => s + (l.kgSaved || 0), 0);
    const totalCO2 = logs.reduce((s, l) => s + (l.co2Saved || 0), 0);
    const totalMeals = logs.reduce((s, l) => s + (l.mealsServed || 0), 0);
    const totalEarned = logs.reduce((s, l) => s + (l.volunteerEarned || 0), 0);

    const leaderboard = await User.find({ role: 'restaurant' })
      .sort('-karmaScore').limit(10).select('name karmaScore');

    res.json({ totalKg, totalCO2, totalMeals, totalListings: logs.length, totalEarned, leaderboard });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Volunteer's own earnings
router.get('/myearnings', protect('volunteer'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('totalEarned karmaScore name');
    const logs = await ImpactLog.find({ volunteerId: req.user._id });
    const totalDeliveries = logs.length;
    const totalKg = logs.reduce((s, l) => s + (l.kgSaved || 0), 0);
    res.json({ ...user.toObject(), totalDeliveries, totalKg });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;