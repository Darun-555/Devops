const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/user');

dotenv.config();

const createAdmin = async () => {
  await connectDB();

  const adminExists = await User.findOne({ email: 'admin@gmail.com' });

  if (adminExists) {
    console.log('Admin already exists');
    return;
  }

  await User.create({
    fullName: 'Admin',
    email: 'admin@gmail.com',
    password: '123456',
    role: 'admin',
    department: 'IT'
  });

  console.log('Admin created successfully');
};

createAdmin()
  .then(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Seed admin failed:', error.message);

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    process.exit(1);
  });
