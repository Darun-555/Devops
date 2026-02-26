const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.post('/register', protect, authorizeRoles('admin'), registerUser);
router.post('/login', loginUser);

module.exports = router;
