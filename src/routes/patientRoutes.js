const express = require('express');
const patientController = require('../controllers/patientController');
const validateRequest = require('../middleware/validateRequest');
const asyncHandler = require('../middleware/asyncHandler');
const requireRole = require('../middleware/requireRole');
const {
  patientIdParamSchema,
  registerPatientSchema,
  additionalDiseasesSchema,
  referralSchema
} = require('../validators/patientValidators');

const router = express.Router();

router.post(
  '/register',
  requireRole('registration_clerk'),
  validateRequest(registerPatientSchema),
  asyncHandler(patientController.registerPatient)
);

router.get(
  '/:patientID',
  requireRole('doctor', 'nurse', 'paramedic', 'admin'),
  validateRequest(patientIdParamSchema, 'params'),
  asyncHandler(patientController.getPatientById)
);

router.get(
  '/',
  requireRole('admin'),
  asyncHandler(patientController.getAllPatients)
);

router.patch(
  '/:patientID/diseases',
  requireRole('doctor', 'nurse', 'paramedic'),
  validateRequest(patientIdParamSchema, 'params'),
  validateRequest(additionalDiseasesSchema),
  asyncHandler(patientController.appendAdditionalDiseases)
);

router.post(
  '/:patientID/referrals',
  requireRole('doctor'),
  validateRequest(patientIdParamSchema, 'params'),
  validateRequest(referralSchema),
  asyncHandler(patientController.addReferralDetails)
);

module.exports = router;
