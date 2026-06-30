const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true },
  password:     { type: String, required: true },
  role:         { type: String, enum: ['restaurant','shelter','volunteer','admin'], required: true },
  phoneNumber:  { type: String },
  websiteLink:  { type: String },
  location:     { lat: Number, lng: Number, address: String },
  karmaScore:   { type: Number, default: 0 },
  totalEarned:  { type: Number, default: 0 },
  dietaryPrefs: [String],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);