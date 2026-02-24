const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

// Define the route: POST http://localhost:3000/api/patients/register
router.post('/register', patientController.registerPatient);
router.get('/:patientID', patientController.getPatientById);
router.get('/', patientController.getAllPatients);
router.patch('/:patientID/diseases', patientController.appendAdditionalDiseases);
router.post('/:patientID/referrals', patientController.addReferralDetails);


module.exports = router;