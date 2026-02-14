const admissionService = require('../services/admissionService');

const admitPatient = async (req, res) => {
  const admission = await admissionService.admitPatient({
    patientId: req.body.patientId,
    wardId: req.body.wardId,
    admittedBy: req.user.id
  });

  return res.status(201).json({
    success: true,
    message: 'Patient admitted successfully',
    data: admission
  });
};

const getAdmissionById = async (req, res) => {
  const admission = await admissionService.getAdmissionById(req.params.id);

  return res.status(200).json({
    success: true,
    message: 'Admission retrieved successfully',
    data: admission
  });
};

const getPatientAdmissions = async (req, res) => {
  const admissions = await admissionService.getPatientAdmissions(req.params.patientId);

  return res.status(200).json({
    success: true,
    message: 'Admissions retrieved successfully',
    data: admissions
  });
};

const recordVitals = async (req, res) => {
  const record = await admissionService.recordVitals({
    admissionId: req.body.admissionId,
    patientId: req.body.patientId,
    temperature: req.body.temperature,
    bloodPressure: req.body.bloodPressure,
    pulseRate: req.body.pulseRate,
    recordedBy: req.user.id
  });

  return res.status(201).json({
    success: true,
    message: 'Vitals recorded successfully',
    data: record
  });
};

const recordMedication = async (req, res) => {
  const record = await admissionService.recordMedication({
    admissionId: req.body.admissionId,
    patientId: req.body.patientId,
    medicineGiven: req.body.medicineGiven,
    intakeAmount: req.body.intakeAmount,
    outputAmount: req.body.outputAmount,
    recordedBy: req.user.id
  });

  return res.status(201).json({
    success: true,
    message: 'Medication recorded successfully',
    data: record
  });
};

const addDoctorNote = async (req, res) => {
  const note = await admissionService.addDoctorNote({
    admissionId: req.body.admissionId,
    patientId: req.body.patientId,
    diagnosis: req.body.diagnosis,
    treatment: req.body.treatment,
    prescription: req.body.prescription,
    progressNotes: req.body.progressNotes,
    createdBy: req.user.id
  });

  return res.status(201).json({
    success: true,
    message: 'Doctor note added successfully',
    data: note
  });
};

const dischargeAdmission = async (req, res) => {
  const admission = await admissionService.dischargeAdmission({
    admissionId: req.params.id,
    dischargeSummary: req.body.dischargeSummary
  });

  return res.status(200).json({
    success: true,
    message: 'Patient discharged successfully',
    data: admission
  });
};

module.exports = {
  admitPatient,
  getAdmissionById,
  getPatientAdmissions,
  recordVitals,
  recordMedication,
  addDoctorNote,
  dischargeAdmission
};
