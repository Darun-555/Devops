const mongoose = require('mongoose');

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

const referralSchema = new mongoose.Schema(
  {
    service: {
      type: String,
      required: true,
      trim: true,
      enum: SERVICE_POINTS
    },
    reason: { type: String, required: true, trim: true, maxlength: 300 },
    referredBy: { type: String, required: true, trim: true, maxlength: 80 },
    notes: { type: String, trim: true, maxlength: 500 },
    referredAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const patientSchema = new mongoose.Schema(
  {
    patientID: { type: String, required: true, unique: true, index: true, trim: true },
    firstName: { type: String, required: true, trim: true, maxlength: 60 },
    lastName: { type: String, required: true, trim: true, maxlength: 60 },
    dob: {
      type: Date,
      required: true,
      max: [Date.now, 'dob cannot be in the future']
    },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
      match: /^[0-9+()\-\s]{7,20}$/
    },
    entryPoint: {
      type: String,
      enum: ['A&E', 'OPD'],
      required: true
    },
    servicePoint: {
      type: String,
      enum: SERVICE_POINTS,
      required: true
    },
    knownDiseases: [{ type: String, trim: true }],
    initialComplaints: [{ type: String, trim: true }],
    additionalDiseases: [{ type: String, trim: true }],
    referralDetails: [referralSchema],
    registeredBy: { type: String, required: true, trim: true, maxlength: 80 },
    registrationDate: { type: Date, default: Date.now, immutable: true }
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Patient || mongoose.model('Patient', patientSchema, 'patients');
