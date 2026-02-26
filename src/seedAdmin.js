const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/user");

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    const adminExists = await User.findOne({ email: "admin@gmail.com" });

    if (adminExists) {
      console.log("Admin already exists");
      process.exit();
    }

    await User.create({
      fullName: "Admin",
      email: "admin@gmail.com",
      password: "123456",
      role: "ADMIN",
      department: "IT",
    });

    console.log("Admin created successfully");
    process.exit();
  } catch (error) {
    console.error("Connection error:", error);
    process.exit(1);
  }
};

createAdmin();