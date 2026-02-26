const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Only Super Admin can create staff
router.post("/register", protect, authorizeRoles("ADMIN"), registerUser);

// Login for all staff
router.post("/login", loginUser);

module.exports = router;