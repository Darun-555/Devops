const express = require('express');
const admissionController = require('../controllers/admissionController');
const validateRequest = require('../middleware/validateRequest');
const requireRole = require('../middleware/requireRole');
const asyncHandler = require('../middleware/asyncHandler');
const {
  admitSchema,
  admissionIdParamSchema,
  patientIdParamSchema,
  recordVitalsSchema,
  recordMedicationSchema,
  doctorNoteSchema,
  dischargeSchema
} = require('../validators/admissionValidators');

const router = express.Router();

router.post(
  '/admit',
  requireRole('doctor'),
  validateRequest(admitSchema),
  asyncHandler(admissionController.admitPatient)
);

router.get(
  '/:id',
  requireRole('doctor', 'nurse', 'paramedic', 'admin'),
  validateRequest(admissionIdParamSchema, 'params'),
  asyncHandler(admissionController.getAdmissionById)
);

router.post(
  '/vitals',
  requireRole('nurse'),
  validateRequest(recordVitalsSchema),
  asyncHandler(admissionController.recordVitals)
);

router.post(
  '/medication',
  requireRole('nurse'),
  validateRequest(recordMedicationSchema),
  asyncHandler(admissionController.recordMedication)
);

router.post(
  '/doctor-note',
  requireRole('doctor'),
  validateRequest(doctorNoteSchema),
  asyncHandler(admissionController.addDoctorNote)
);

router.put(
  '/discharge/:id',
  requireRole('doctor'),
  validateRequest(admissionIdParamSchema, 'params'),
  validateRequest(dischargeSchema),
  asyncHandler(admissionController.dischargeAdmission)
);

router.get(
  '/patient/:patientId',
  requireRole('doctor', 'nurse', 'paramedic', 'admin'),
  validateRequest(patientIdParamSchema, 'params'),
  asyncHandler(admissionController.getPatientAdmissions)
);

module.exports = router;
