const mongoose = require('mongoose');
const Admission = require('../models/Admission');
const Ward = require('../models/Ward');
const VitalRecord = require('../models/VitalRecord');
const MedicationRecord = require('../models/MedicationRecord');
const DoctorNote = require('../models/DoctorNote');
require('../models/Patient');
require('../models/user');
const AppError = require('../utils/AppError');

const admitPatient = async ({ patientId, wardId, admittedBy }) => {
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

    const existingAdmission = await Admission.findOne({
      patientId,
      status: 'admitted'
    }).session(session);

    if (existingAdmission) {
      throw new AppError('Patient already admitted', 409);
    }

    const [admission] = await Admission.create(
      [{ patientId, wardId, admittedBy }],
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

const getPatientAdmissions = async (patientId) => {
  const admissions = await Admission.find({ patientId })
    .populate('wardId')
    .sort({ admissionDate: -1 });

  return admissions;
};

const ensureActiveAdmission = async (admissionId, patientId) => {
  const admission = await Admission.findById(admissionId);

  if (!admission) {
    throw new AppError('Admission not found', 404);
  }

  if (admission.status !== 'admitted') {
    throw new AppError('Admission is not active', 409);
  }

  if (patientId && admission.patientId.toString() !== patientId) {
    throw new AppError('Patient does not match admission', 400);
  }

  return admission;
};

const recordVitals = async (payload) => {
  await ensureActiveAdmission(payload.admissionId, payload.patientId);

  const record = await VitalRecord.create(payload);
  return record;
};

const recordMedication = async (payload) => {
  await ensureActiveAdmission(payload.admissionId, payload.patientId);

  const record = await MedicationRecord.create(payload);
  return record;
};

const addDoctorNote = async (payload) => {
  await ensureActiveAdmission(payload.admissionId, payload.patientId);

  const note = await DoctorNote.create(payload);
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
