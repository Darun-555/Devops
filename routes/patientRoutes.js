const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

// Define the route: POST http://localhost:3000/api/patients/register
router.post('/register', patientController.registerPatient);

module.exports = router;