const User = require("../models/user");
const jwt = require("jsonwebtoken");

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Register User (Super Admin Only)
exports.registerUser = async (req, res) => {
  try {
    const { fullName, email, password, role, department } = req.body;

    // Validate role
    const validRoles = [
      "admin",
      "registration_clerk",
      "doctor",
      "nurse",
      "paramedic",
      "technical_staff",
    ];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({
      fullName,
      email,
      password,
      role,
      department,
    });

    await user.save(); // pre-save hook hashes password

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        token: generateToken(user._id, user.role),
        user: {
          id: user._id,
          fullName: user.fullName,
          role: user.role,
          department: user.department,
        },
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};