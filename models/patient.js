const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  // Unique ID for the hospital system
  patientID: { type: String, required: true, unique: true, index: true, trim: true },
  
  // Basic Personal Details 
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
  
  // Operational Data 
  entryPoint: { 
    type: String, 
    enum: ['A&E', 'OPD'], 
    required: true,
    description: "Whether the patient came via Emergency or Outpatient" 
  },

  servicePoint: {
  type: String,
  enum: [
    'Radiology',
    'Pathology',
    'BloodBank',
    'Physiotherapy',
    'OperationTheatre',
    'ICU',
    'CCU',
    'Ward'
  ],
  required: true
  },

  // Medical Initial Data 
  knownDiseases: [{ type: String, trim: true }], 
  initialComplaints: [{ type: String, trim: true }],

  // Data that can be added later by clinical staff.
  additionalDiseases: [{ type: String, trim: true }],
  referralDetails: [referralSchema],

  // Who registered them
  registeredBy: { type: String, required: true, trim: true, maxlength: 80 }, // Clerk's Username/ID
  registrationDate: { type: Date, default: Date.now, immutable: true }
}, {
  timestamps: true
});

// Clinical referrals added after initial registration.
const referralSchema = new mongoose.Schema(
  {
    service: {
      type: String,
      required: true,
      trim: true,
      enum: [
        'Radiology',
        'Pathology',
        'BloodBank',
        'Physiotherapy',
        'OperationTheatre',
        'ICU',
        'CCU',
        'Ward'
      ]
    },
    reason: { type: String, required: true, trim: true, maxlength: 300 },
    referredBy: { type: String, required: true, trim: true, maxlength: 80 },
    notes: { type: String, trim: true, maxlength: 500 },
    referredAt: { type: Date, default: Date.now }
  },
  { _id: false }
);
module.exports = mongoose.model('Patients', patientSchema);
