const Joi = require('joi');
const { objectId } = require('./common');

const admitSchema = Joi.object({
  patientID: Joi.string().trim().required(),
  wardId: objectId.required()
});

const admissionIdParamSchema = Joi.object({
  id: objectId.required()
});

const patientIdParamSchema = Joi.object({
  patientID: Joi.string().trim().required()
});

const recordVitalsSchema = Joi.object({
  admissionId: objectId.required(),
  patientID: Joi.string().trim().required(),
  temperature: Joi.number().min(25).max(45).required(),
  bloodPressure: Joi.string().min(3).max(20).required(),
  pulseRate: Joi.number().integer().min(20).max(250).required()
});

const recordMedicationSchema = Joi.object({
  admissionId: objectId.required(),
  patientID: Joi.string().trim().required(),
  medicineGiven: Joi.string().min(2).max(200).required(),
  intakeAmount: Joi.number().min(0).optional(),
  outputAmount: Joi.number().min(0).optional()
});

const doctorNoteSchema = Joi.object({
  admissionId: objectId.required(),
  patientID: Joi.string().trim().required(),
  diagnosis: Joi.string().min(2).max(500).required(),
  treatment: Joi.string().min(2).max(500).required(),
  prescription: Joi.string().min(2).max(500).optional(),
  progressNotes: Joi.string().min(2).max(1000).optional()
});

const dischargeSchema = Joi.object({
  dischargeSummary: Joi.string().min(5).max(2000).required()
});

module.exports = {
  admitSchema,
  admissionIdParamSchema,
  patientIdParamSchema,
  recordVitalsSchema,
  recordMedicationSchema,
  doctorNoteSchema,
  dischargeSchema
};
