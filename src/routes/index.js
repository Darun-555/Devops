const express = require('express');
const wardRoutes = require('./wardRoutes');
const admissionRoutes = require('./admissionRoutes');

const router = express.Router();

router.use('/wards', wardRoutes);
router.use('/admissions', admissionRoutes);

module.exports = router;
