const { randomUUID } = require('crypto');
const Patient = require('../models/Patient');
const AppError = require('../utils/AppError');

const generatePatientId = () =>
  `PAT-${new Date().getFullYear()}-${randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`;

const registerPatient = async (req, res) => {
  const patient = await Patient.create({
    patientID: generatePatientId(),
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    dob: req.body.dob,
    gender: req.body.gender,
    contactNumber: req.body.contactNumber,
    entryPoint: req.body.entryPoint,
    servicePoint: req.body.servicePoint,
    knownDiseases: req.body.knownDiseases,
    initialComplaints: req.body.initialComplaints,
    registeredBy: req.body.registeredBy
  });

  return res.status(201).json({
    success: true,
    message: 'Patient registered successfully',
    data: patient
  });
};

const appendAdditionalDiseases = async (req, res) => {
  const patient = await Patient.findOne({ patientID: req.params.patientID });

  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  const existing = new Set(
    (patient.additionalDiseases || []).map((item) => String(item).toLowerCase())
  );

  const toAdd = req.body.diseases
    .map((item) => String(item).trim())
    .filter((item) => item.length > 0)
    .filter((item) => !existing.has(item.toLowerCase()));

  patient.additionalDiseases = [...(patient.additionalDiseases || []), ...toAdd];
  await patient.save();

  return res.status(200).json({
    success: true,
    message: 'Additional diseases updated',
    data: {
      added: toAdd,
      patient
    }
  });
};

const addReferralDetails = async (req, res) => {
  const patient = await Patient.findOne({ patientID: req.params.patientID });

  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  patient.referralDetails = [
    ...(patient.referralDetails || []),
    {
      service: req.body.service,
      reason: req.body.reason,
      referredBy: req.body.referredBy,
      notes: req.body.notes || undefined
    }
  ];

  await patient.save();

  return res.status(201).json({
    success: true,
    message: 'Referral added successfully',
    data: patient
  });
};

const getPatientById = async (req, res) => {
  const patient = await Patient.findOne({ patientID: req.params.patientID });

  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  return res.status(200).json({
    success: true,
    message: 'Patient retrieved successfully',
    data: patient
  });
};

const getAllPatients = async (req, res) => {
  const patients = await Patient.find().sort({ registrationDate: -1 });

  return res.status(200).json({
    success: true,
    message: 'Patients retrieved successfully',
    data: patients
  });
};

module.exports = {
  registerPatient,
  appendAdditionalDiseases,
  addReferralDetails,
  getPatientById,
  getAllPatients
};
