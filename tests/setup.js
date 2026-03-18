const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('../src/config/db');

before(async () => {
  await connectDB();
  console.log('MongoDB connected for tests');
});

after(async () => {
  await mongoose.connection.close();
  console.log('MongoDB disconnected after tests');
});
