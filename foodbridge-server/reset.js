const mongoose = require('mongoose');
require('dotenv').config();

async function reset() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected ✅');

  await mongoose.connection.collection('listings').deleteMany({});
  console.log('Listings cleared ✅');

  await mongoose.connection.collection('impactlogs').deleteMany({});
  console.log('Impact logs cleared ✅');

  // Uncomment below to also delete users
  // await mongoose.connection.collection('users').deleteMany({});
  // console.log('Users cleared ✅');

  await mongoose.disconnect();
  console.log('Done!');
}

reset();