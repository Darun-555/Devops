const express = require('express');
const patientRoutes = require('./patientRoutes');
const wardRoutes = require('./wardRoutes');
const admissionRoutes = require('./admissionRoutes');

const router = express.Router();

router.use('/patients', patientRoutes);
router.use('/wards', wardRoutes);
router.use('/admissions', admissionRoutes);

module.exports = router;
