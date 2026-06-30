const mongoose = require('mongoose');

const impactSchema = new mongoose.Schema({
  listingId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
  volunteerId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  kgSaved:         Number,
  co2Saved:        Number,
  mealsServed:     Number,
  volunteerEarned: Number,
}, { timestamps: true });

module.exports = mongoose.model('ImpactLog', impactSchema);