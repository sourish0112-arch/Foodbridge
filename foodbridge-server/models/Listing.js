const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  restaurantId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:         { type: String, required: true },
  description:   String,
  quantity:      { type: Number, required: true },
  unit:          { type: String, default: 'kg' },
  category:      { type: String, enum: ['cooked','raw','packaged','baked'] },
  imageUrl:      String,
  expiresAt:     Date,
  storageAdvice: String,
  status: {
    type: String,
    enum: ['available','claimed','picked','dropped','delivered'],
    default: 'available'
  },
  claimedBy:           { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pickedBy:            { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pickupOTP:           String,
  otpVerified:         { type: Boolean, default: false },
  deliveryOTP:         String,
  deliveryOtpVerified: { type: Boolean, default: false },
  qrScannedAt:         Date,
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);