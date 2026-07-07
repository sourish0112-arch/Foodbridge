const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const Listing = require('../models/Listing');
const ImpactLog = require('../models/ImpactLog');
const User = require('../models/User');

function getAIExpiry(title) {
  const t = title.toLowerCase();
  if (t.includes('biryani')) return { safeHours: 4, storageAdvice: 'Refrigerate immediately, reheat thoroughly before serving' };
  if (t.includes('fried rice') || t.includes('schezwan rice')) return { safeHours: 3, storageAdvice: 'Refrigerate immediately, best consumed within 3 hours' };
  if (t.includes('pulao') || t.includes('jeera rice')) return { safeHours: 5, storageAdvice: 'Keep covered and refrigerated below 4°C' };
  if (t.includes('rice') || t.includes('chawal')) return { safeHours: 4, storageAdvice: 'Keep covered and refrigerated below 4°C' };
  if (t.includes('khichdi')) return { safeHours: 4, storageAdvice: 'Refrigerate and reheat with a little water before serving' };
  if (t.includes('idli') || t.includes('idly')) return { safeHours: 5, storageAdvice: 'Keep covered at room temperature, best served fresh' };
  if (t.includes('dosa') || t.includes('uttapam') || t.includes('appam')) return { safeHours: 3, storageAdvice: 'Best consumed immediately, wrap in foil to keep warm' };
  if (t.includes('dal makhani') || t.includes('daal makhani')) return { safeHours: 6, storageAdvice: 'Refrigerate, reheat on low flame with butter' };
  if (t.includes('dal') || t.includes('daal') || t.includes('lentil')) return { safeHours: 5, storageAdvice: 'Keep covered and refrigerated below 4°C' };
  if (t.includes('butter chicken') || t.includes('murgh makhani')) return { safeHours: 3, storageAdvice: 'Refrigerate immediately, reheat thoroughly' };
  if (t.includes('chicken curry') || t.includes('chicken masala')) return { safeHours: 3, storageAdvice: 'Must be refrigerated, consume within 3 hours' };
  if (t.includes('paneer butter masala') || t.includes('shahi paneer')) return { safeHours: 5, storageAdvice: 'Refrigerate in airtight container, reheat gently' };
  if (t.includes('paneer')) return { safeHours: 4, storageAdvice: 'Must be kept refrigerated at all times' };
  if (t.includes('palak') || t.includes('saag') || t.includes('spinach')) return { safeHours: 4, storageAdvice: 'Refrigerate immediately, best consumed same day' };
  if (t.includes('rajma') || t.includes('chole') || t.includes('chana')) return { safeHours: 6, storageAdvice: 'Keep covered and refrigerated, reheats well' };
  if (t.includes('sambhar') || t.includes('sambar')) return { safeHours: 4, storageAdvice: 'Refrigerate and reheat before serving' };
  if (t.includes('curry') || t.includes('gravy') || t.includes('masala') || t.includes('sabzi')) return { safeHours: 4, storageAdvice: 'Keep covered and refrigerated below 4°C' };
  if (t.includes('naan') || t.includes('kulcha') || t.includes('tandoori roti')) return { safeHours: 6, storageAdvice: 'Wrap in foil while warm, store in airtight container' };
  if (t.includes('paratha')) return { safeHours: 8, storageAdvice: 'Stack with butter paper between each, keep covered' };
  if (t.includes('puri') || t.includes('poori') || t.includes('bhatura')) return { safeHours: 3, storageAdvice: 'Best consumed fresh, wrap in cloth to keep soft' };
  if (t.includes('roti') || t.includes('chapati') || t.includes('phulka')) return { safeHours: 6, storageAdvice: 'Wrap in foil or cloth, store in airtight container' };
  if (t.includes('bread') || t.includes('bun') || t.includes('pav')) return { safeHours: 12, storageAdvice: 'Store in airtight bag at room temperature' };
  if (t.includes('samosa')) return { safeHours: 6, storageAdvice: 'Keep at room temperature, reheat in oven before serving' };
  if (t.includes('pav bhaji')) return { safeHours: 4, storageAdvice: 'Refrigerate bhaji separately, toast pav fresh' };
  if (t.includes('vada')) return { safeHours: 4, storageAdvice: 'Keep covered at room temperature' };
  if (t.includes('pakora') || t.includes('bhajia')) return { safeHours: 4, storageAdvice: 'Keep at room temperature, reheat in oven to crisp up' };
  if (t.includes('dhokla')) return { safeHours: 8, storageAdvice: 'Keep covered at room temperature' };
  if (t.includes('poha') || t.includes('upma')) return { safeHours: 4, storageAdvice: 'Keep covered, best consumed within 4 hours' };
  if (t.includes('burger') || t.includes('wrap') || t.includes('roll')) return { safeHours: 3, storageAdvice: 'Keep refrigerated, do not leave at room temperature' };
  if (t.includes('pizza')) return { safeHours: 6, storageAdvice: 'Refrigerate, reheat in oven or pan before serving' };
  if (t.includes('pasta') || t.includes('noodle')) return { safeHours: 4, storageAdvice: 'Refrigerate, add a splash of water when reheating' };
  if (t.includes('momos') || t.includes('dumpling')) return { safeHours: 4, storageAdvice: 'Keep covered, reheat by steaming or pan frying' };
  if (t.includes('soup') || t.includes('broth') || t.includes('stew')) return { safeHours: 3, storageAdvice: 'Keep hot above 60°C or refrigerate immediately' };
  if (t.includes('fish') || t.includes('prawn') || t.includes('seafood')) return { safeHours: 2, storageAdvice: 'Must be refrigerated immediately, very perishable' };
  if (t.includes('mutton') || t.includes('lamb')) return { safeHours: 3, storageAdvice: 'Refrigerate immediately, reheat thoroughly to 75°C+' };
  if (t.includes('chicken') || t.includes('murgh')) return { safeHours: 2, storageAdvice: 'Refrigerate immediately, handle with care' };
  if (t.includes('egg') || t.includes('omelette') || t.includes('anda')) return { safeHours: 3, storageAdvice: 'Keep refrigerated, consume within the day' };
  if (t.includes('kebab') || t.includes('tikka') || t.includes('tandoori')) return { safeHours: 3, storageAdvice: 'Refrigerate, reheat in oven or pan before serving' };
  if (t.includes('milk') || t.includes('doodh')) return { safeHours: 4, storageAdvice: 'Must be kept refrigerated at all times' };
  if (t.includes('curd') || t.includes('yogurt') || t.includes('dahi')) return { safeHours: 6, storageAdvice: 'Must be kept refrigerated at all times' };
  if (t.includes('kheer') || t.includes('payasam')) return { safeHours: 6, storageAdvice: 'Refrigerate immediately, serve chilled' };
  if (t.includes('gulab jamun') || t.includes('rasgulla') || t.includes('rasmalai')) return { safeHours: 12, storageAdvice: 'Keep refrigerated in sugar syrup' };
  if (t.includes('halwa') || t.includes('barfi') || t.includes('ladoo')) return { safeHours: 24, storageAdvice: 'Store in airtight container in cool dry place' };
  if (t.includes('cake') || t.includes('pastry') || t.includes('muffin')) return { safeHours: 24, storageAdvice: 'Store in airtight container, refrigerate if cream-based' };
  if (t.includes('ice cream') || t.includes('kulfi')) return { safeHours: 1, storageAdvice: 'Must stay frozen, transfer to freezer immediately' };
  if (t.includes('jalebi')) return { safeHours: 8, storageAdvice: 'Keep at room temperature in covered container' };
  if (t.includes('salad') || t.includes('raita')) return { safeHours: 2, storageAdvice: 'Keep refrigerated, consume as soon as possible' };
  if (t.includes('juice') || t.includes('smoothie') || t.includes('lassi')) return { safeHours: 4, storageAdvice: 'Keep refrigerated and consume within the day' };
  if (t.includes('packaged') || t.includes('sealed') || t.includes('canned')) return { safeHours: 72, storageAdvice: 'Check packaging for storage instructions' };
  return { safeHours: 4, storageAdvice: 'Store in a cool, dry place and consume soon' };
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST listing
router.post('/', protect('restaurant'), async (req, res) => {
  const { title, description, quantity, unit, category, imageUrl, cookedHoursSince } = req.body;
  try {
    let effectiveHours;
    let cookedAge = Number(cookedHoursSince);

    if (category === 'cooked') {
      if (Number.isNaN(cookedAge) || cookedAge < 0) {
        return res.status(400).json({ message: 'Please provide a valid number of hours since cooking.' });
      }
      if (cookedAge >= 16) {
        return res.status(400).json({ message: 'This cooked food is stale and cannot be listed.' });
      }
    } else {
      cookedAge = undefined;
    }

    const { safeHours, storageAdvice } = getAIExpiry(title);
    const remainingLife = category === 'cooked' ? 16 - cookedAge : safeHours;
    effectiveHours = category === 'cooked' ? Math.min(safeHours, remainingLife) : safeHours;

    const expiresAt = new Date(Date.now() + effectiveHours * 3600 * 1000);
    const listing = await Listing.create({
      restaurantId: req.user._id,
      title, description, quantity, unit, category, imageUrl,
      cookedHoursSince: cookedAge,
      expiresAt, storageAdvice
    });
    req.app.get('io').emit('new_listing', listing);
    res.status(201).json(listing);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET all available
router.get('/', async (req, res) => {
  try {
    const listings = await Listing.find({ status: 'available' })
      .populate('restaurantId', 'name location').sort('-createdAt');
    res.json(listings);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET claimed (volunteers)
router.get('/claimed', protect('volunteer'), async (req, res) => {
  try {
    const listings = await Listing.find({ status: 'claimed' })
      .populate('restaurantId', 'name location').populate('claimedBy', 'name');
    res.json(listings);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET my pickups (volunteer)
router.get('/mypickups', protect('volunteer'), async (req, res) => {
  try {
    const listings = await Listing.find({
      status: { $in: ['picked', 'dropped', 'delivered'] },
      pickedBy: req.user._id
    }).populate('restaurantId', 'name location').populate('claimedBy', 'name _id');
    res.json(listings);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET my listings (restaurant)
router.get('/mylistings', protect('restaurant'), async (req, res) => {
  try {
    const listings = await Listing.find({ restaurantId: req.user._id }).sort('-createdAt');
    res.json(listings);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET my claims (shelter)
router.get('/myclaims', protect('shelter'), async (req, res) => {
  try {
    const listings = await Listing.find({
      claimedBy: req.user._id,
      status: { $in: ['claimed', 'picked', 'dropped', 'delivered'] }
    }).populate('restaurantId', 'name location').populate('pickedBy', 'name');
    res.json(listings);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// CLAIM
router.patch('/:id/claim', protect('shelter'), async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(req.params.id,
      { status: 'claimed', claimedBy: req.user._id }, { new: true });
    res.json(listing);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PICKUP — volunteer accepts, pickup OTP generated
router.patch('/:id/pickup', protect('volunteer'), async (req, res) => {
  try {
    const otp = generateOTP();
    const listing = await Listing.findByIdAndUpdate(req.params.id,
      { status: 'picked', pickedBy: req.user._id, pickupOTP: otp, otpVerified: false },
      { new: true }
    );
    res.json(listing);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// VERIFY PICKUP OTP — restaurant verifies volunteer
router.patch('/:id/verifyotp', protect('restaurant'), async (req, res) => {
  const { otp } = req.body;
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.otpVerified) return res.status(400).json({ message: 'OTP already used' });
    if (listing.pickupOTP !== otp) return res.status(400).json({ message: 'Wrong OTP. Try again.' });

    const updated = await Listing.findByIdAndUpdate(req.params.id,
      { otpVerified: true, qrScannedAt: new Date() }, { new: true });

    req.app.get('io').to(listing.pickedBy.toString()).emit('otp_verified', {
      listingId: listing._id, title: listing.title
    });

    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DROPPED — volunteer marks as dropped (simple button)
router.patch('/:id/dropped', protect('volunteer'), async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(req.params.id,
      { status: 'dropped' }, { new: true }
    ).populate('claimedBy', 'name _id').populate('restaurantId', 'name');

    const io = req.app.get('io');
    io.to(listing.claimedBy._id.toString()).emit('delivery_dropped', {
      listingId: listing._id,
      title: listing.title,
      quantity: listing.quantity,
      unit: listing.unit,
      volunteerName: req.user.name
    });

    res.json(listing);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELIVER — shelter confirms receipt (simple button)
router.patch('/:id/deliver', protect('shelter'), async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(req.params.id,
      { status: 'delivered' }, { new: true });

    const kgSaved = listing.quantity;
    const co2Saved = kgSaved * 2.5;
    const mealsServed = Math.floor(kgSaved * 3.5);
    const volunteerEarned = parseFloat((kgSaved * 10).toFixed(2));

    await ImpactLog.create({
      listingId: listing._id, kgSaved, co2Saved,
      mealsServed, volunteerEarned, volunteerId: listing.pickedBy
    });

    await User.findByIdAndUpdate(listing.restaurantId, { $inc: { karmaScore: 10 } });
    await User.findByIdAndUpdate(listing.pickedBy, {
      $inc: { totalEarned: volunteerEarned, karmaScore: 5 }
    });

    const io = req.app.get('io');
    io.to(listing.pickedBy.toString()).emit('delivery_confirmed', {
      listingId: listing._id,
      title: listing.title,
      earned: volunteerEarned
    });

    res.json({ listing, impact: { kgSaved, co2Saved, mealsServed, volunteerEarned } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// REJECT — shelter says food not received (simple button)
router.patch('/:id/reject', protect('shelter'), async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(req.params.id,
      { status: 'picked' }, { new: true });

    const io = req.app.get('io');
    io.to(listing.pickedBy.toString()).emit('delivery_rejected', {
      listingId: listing._id,
      title: listing.title
    });

    res.json(listing);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE listing (restaurant owner only)
router.delete('/:id', protect('restaurant'), async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (!listing.restaurantId.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }
    if (listing.status !== 'available') {
      return res.status(400).json({ message: 'Only available listings can be deleted' });
    }

    await Listing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Listing deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;