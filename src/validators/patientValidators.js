const Joi = require('joi');

const SERVICE_POINTS = [
  'Radiology',
  'Pathology',
  'BloodBank',
  'Physiotherapy',
  'OperationTheatre',
  'ICU',
  'CCU',
  'Ward'
];

const patientIdParamSchema = Joi.object({
  patientID: Joi.string().trim().required()
});

const registerPatientSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(60).required(),
  lastName: Joi.string().trim().min(1).max(60).required(),
  dob: Joi.date().max('now').required(),
  gender: Joi.string().valid('Male', 'Female', 'Other').required(),
  contactNumber: Joi.string().pattern(/^[0-9+()\-\s]{7,20}$/).required(),
  entryPoint: Joi.string().valid('A&E', 'OPD').required(),
  servicePoint: Joi.string().valid(...SERVICE_POINTS).required(),
  knownDiseases: Joi.array().items(Joi.string().trim().max(120)).default([]),
  initialComplaints: Joi.array().items(Joi.string().trim().max(200)).default([]),
  registeredBy: Joi.string().trim().max(80).required()
});

const additionalDiseasesSchema = Joi.object({
  diseases: Joi.array().items(Joi.string().trim().max(120)).min(1).required()
});

const referralSchema = Joi.object({
  service: Joi.string().valid(...SERVICE_POINTS).required(),
  reason: Joi.string().trim().max(300).required(),
  referredBy: Joi.string().trim().max(80).required(),
  notes: Joi.string().trim().max(500).allow('', null)
});

module.exports = {
  patientIdParamSchema,
  registerPatientSchema,
  additionalDiseasesSchema,
  referralSchema
};
