const mongoose = require('mongoose');
const Admission = require('../models/Admission');
const Ward = require('../models/Ward');
const Patient = require('../models/Patient');
const VitalRecord = require('../models/VitalRecord');
const MedicationRecord = require('../models/MedicationRecord');
const DoctorNote = require('../models/DoctorNote');
require('../models/user');
const AppError = require('../utils/AppError');

const resolvePatientObjectId = async (patientID, session = null) => {
  const query = Patient.findOne({ patientID }).select('_id');

  if (session) {
    query.session(session);
  }

  const patient = await query;

  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  return patient._id;
};

const admitPatient = async ({ patientID, wardId, admittedBy }) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const ward = await Ward.findById(wardId).session(session);
    if (!ward) {
      throw new AppError('Ward not found', 404);
    }

    if (ward.availableBeds <= 0) {
      throw new AppError('No available beds in ward', 409);
    }

    const patientObjectId = await resolvePatientObjectId(patientID, session);

    const existingAdmission = await Admission.findOne({
      patientId: patientObjectId,
      status: 'admitted'
    }).session(session);

    if (existingAdmission) {
      throw new AppError('Patient already admitted', 409);
    }

    const [admission] = await Admission.create(
      [{ patientId: patientObjectId, wardId, admittedBy }],
      { session }
    );

    ward.availableBeds -= 1;
    await ward.save({ session });

    await session.commitTransaction();
    return admission;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getAdmissionById = async (admissionId) => {
  const admission = await Admission.findById(admissionId)
    .populate('wardId')
    .populate('patientId')
    .populate('admittedBy', 'fullName role');

  if (!admission) {
    throw new AppError('Admission not found', 404);
  }

  return admission;
};

const getPatientAdmissions = async (patientID) => {
  const patientObjectId = await resolvePatientObjectId(patientID);

  const admissions = await Admission.find({ patientId: patientObjectId })
    .populate('wardId')
    .sort({ admissionDate: -1 });

  return admissions;
};

const ensureActiveAdmission = async (admissionId, patientObjectId) => {
  const admission = await Admission.findById(admissionId);

  if (!admission) {
    throw new AppError('Admission not found', 404);
  }

  if (admission.status !== 'admitted') {
    throw new AppError('Admission is not active', 409);
  }

  if (patientObjectId && admission.patientId.toString() !== patientObjectId.toString()) {
    throw new AppError('Patient does not match admission', 400);
  }

  return admission;
};

const recordVitals = async (payload) => {
  const patientObjectId = await resolvePatientObjectId(payload.patientID);
  await ensureActiveAdmission(payload.admissionId, patientObjectId);

  const record = await VitalRecord.create({
    admissionId: payload.admissionId,
    patientId: patientObjectId,
    temperature: payload.temperature,
    bloodPressure: payload.bloodPressure,
    pulseRate: payload.pulseRate,
    recordedBy: payload.recordedBy
  });

  return record;
};

const recordMedication = async (payload) => {
  const patientObjectId = await resolvePatientObjectId(payload.patientID);
  await ensureActiveAdmission(payload.admissionId, patientObjectId);

  const record = await MedicationRecord.create({
    admissionId: payload.admissionId,
    patientId: patientObjectId,
    medicineGiven: payload.medicineGiven,
    intakeAmount: payload.intakeAmount,
    outputAmount: payload.outputAmount,
    recordedBy: payload.recordedBy
  });

  return record;
};

const addDoctorNote = async (payload) => {
  const patientObjectId = await resolvePatientObjectId(payload.patientID);
  await ensureActiveAdmission(payload.admissionId, patientObjectId);

  const note = await DoctorNote.create({
    admissionId: payload.admissionId,
    patientId: patientObjectId,
    diagnosis: payload.diagnosis,
    treatment: payload.treatment,
    prescription: payload.prescription,
    progressNotes: payload.progressNotes,
    createdBy: payload.createdBy
  });

  return note;
};

const dischargeAdmission = async ({ admissionId, dischargeSummary }) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const admission = await Admission.findById(admissionId).session(session);
    if (!admission) {
      throw new AppError('Admission not found', 404);
    }

    if (admission.status === 'discharged') {
      throw new AppError('Admission already discharged', 409);
    }

    admission.status = 'discharged';
    admission.dischargeDate = new Date();
    admission.dischargeSummary = dischargeSummary;
    await admission.save({ session });

    const ward = await Ward.findById(admission.wardId).session(session);
    if (!ward) {
      throw new AppError('Ward not found', 404);
    }

    ward.availableBeds += 1;
    await ward.save({ session });

    await session.commitTransaction();
    return admission;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
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
