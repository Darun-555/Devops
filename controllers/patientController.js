const Patient = require('../Models/patient');

// Validate incoming registration payload before database operations.
function validateRegistration(body) {
  const errors = [];

  // Required fields for a new patient registration.
  const required = [
    'firstName', 'lastName', 'dob', 'gender',
    'contactNumber', 'entryPoint', 'registeredBy','servicePoint'
  ];

  // Reject missing or empty required values.
  for (const field of required) {
    if (!body[field] || String(body[field]).trim() === '') {
      errors.push(`${field} is required`);
    }
  }

  const allowedServicePoints = ['Radiology','Pathology','BloodBank','Physiotherapy',
  'OperationTheatre','ICU','CCU','Ward'
  ];

  if (body.servicePoint && !allowedServicePoints.includes(body.servicePoint)) {
    errors.push('servicePoint is invalid');
  }



  // Allow only supported gender values.
  const allowedGenders = ['Male', 'Female', 'Other'];
  if (body.gender && !allowedGenders.includes(body.gender)) {
    errors.push('gender must be Male, Female, or Other');
  }

  // Allow only supported registration entry points.
  const allowedEntryPoints = ['A&E', 'OPD'];
  if (body.entryPoint && !allowedEntryPoints.includes(body.entryPoint)) {
    errors.push('entryPoint must be A&E or OPD');
  }

  // Ensure DOB is valid and not in the future.
  if (body.dob) {
    const dob = new Date(body.dob);
    if (Number.isNaN(dob.getTime())) errors.push('dob must be a valid date');
    else if (dob > new Date()) errors.push('dob cannot be in the future');
  }

  // Basic contact number format check.
  const phoneRegex = /^[0-9+()\-\s]{7,20}$/;
  if (body.contactNumber && !phoneRegex.test(body.contactNumber)) {
    errors.push('contactNumber format is invalid');
  }

  // Optional fields must be arrays when provided.
  if (body.knownDiseases && !Array.isArray(body.knownDiseases)) {
    errors.push('knownDiseases must be an array');
  }

  if (body.initialComplaints && !Array.isArray(body.initialComplaints)) {
    errors.push('initialComplaints must be an array');
  }

  return errors;
}

// POST /api/patients/register
exports.registerPatient = async (req, res) => {
  try {
    // Validate payload and return all validation issues at once.
    const errors = validateRegistration(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    // Extract validated input fields.
    const {
      firstName, lastName, dob, gender, contactNumber,
      entryPoint, knownDiseases, initialComplaints, registeredBy, servicePoint
    } = req.body;

    // Simple patient identifier generation for current module scope.
    // const patientID = 'PAT-' + Date.now();
    const { v4: uuidv4 } = require('uuid');
    const patientID = `PAT-${new Date().getFullYear()}-${uuidv4().split('-')[0].toUpperCase()}`;

    // Create patient document instance.
    const newPatient = new Patient({
      patientID, firstName, lastName, dob, gender, contactNumber,
      entryPoint, knownDiseases, initialComplaints, registeredBy, servicePoint
    });

    // Persist to MongoDB.
    await newPatient.save();

    // Return success response in JSON format.
    res.status(201).json({
      message: 'Patient Registered Successfully',
      patient: newPatient
    });
  } catch (error) {
    // Fallback for unexpected server/database errors.
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/patients/:patientID/diseases
exports.appendAdditionalDiseases = async (req, res) => {
  try {
    const { patientID } = req.params;
    const { diseases } = req.body;

    if (!Array.isArray(diseases) || diseases.length === 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: ['diseases must be a non-empty array of strings']
      });
    }
    const cleaned = diseases
      .map(d => (typeof d === 'string' ? d.trim() : ''))
      .filter(Boolean);

    if (cleaned.length === 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: ['diseases array contains no valid strings']
      });
    }
    const patient = await Patient.findOne({ patientID });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const existing = new Set((patient.additionalDiseases || []).map(x => String(x).toLowerCase()));
    const toAdd = cleaned.filter(x => !existing.has(x.toLowerCase()));

    patient.additionalDiseases = [...(patient.additionalDiseases || []), ...toAdd];
    await patient.save();

    return res.status(200).json({
      message: 'Additional diseases updated',
      added: toAdd,
      patient
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// POST /api/patients/:patientID/referrals
exports.addReferralDetails = async (req, res) => {
  try {
    const { patientID } = req.params;
    const { service, reason, referredBy, notes } = req.body;

    const errors = [];
    const allowedServices = [
      'Radiology','Pathology','BloodBank','Physiotherapy',
      'OperationTheatre','ICU','CCU','Ward'
    ];

    if (!service || !allowedServices.includes(service)) errors.push('service is invalid');
    if (!reason || String(reason).trim() === '') errors.push('reason is required');
    if (!referredBy || String(referredBy).trim() === '') errors.push('referredBy is required');
    if (notes && String(notes).length > 500) errors.push('notes must be <= 500 characters');

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    const patient = await Patient.findOne({ patientID });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const referral = {
      service,
      reason: String(reason).trim(),
      referredBy: String(referredBy).trim(),
      notes: notes ? String(notes).trim() : undefined,
      referredAt: new Date()
    };

    patient.referralDetails = [...(patient.referralDetails || []), referral];
    await patient.save();

    return res.status(201).json({
      message: 'Referral added successfully',
      referral,
      patient
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// GET /api/patients/:patientID
exports.getPatientById = async (req, res) => {
  try {
    const { patientID } = req.params;
    const patient = await Patient.findOne({ patientID });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.status(200).json({ patient });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/patients
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find().sort({ registrationDate: -1 });
    res.status(200).json({ count: patients.length, patients });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
