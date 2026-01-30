const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  // Unique ID for the hospital system
  patientID: { type: String, required: true, unique: true },
  
  // Basic Personal Details 
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  contactNumber: { type: String, required: true },
  
  // Operational Data 
  entryPoint: { 
    type: String, 
    enum: ['A&E', 'OPD'], 
    required: true,
    description: "Whether the patient came via Emergency or Outpatient" 
  },

  // Medical Initial Data 
  knownDiseases: [String], 
  initialComplaints: [String], 

  // Who registered them
  registeredBy: { type: String, required: true }, // Clerk's Username/ID
  registrationDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Patient', patientSchema);