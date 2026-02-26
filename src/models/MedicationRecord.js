const mongoose = require('mongoose');

const MedicationRecordSchema = new mongoose.Schema(
  {
    admissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admission',
      required: true
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    medicineGiven: {
      type: String,
      required: true,
      trim: true
    },
    intakeAmount: {
      type: Number,
      min: 0
    },
    outputAmount: {
      type: Number,
      min: 0
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recordedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('MedicationRecord', MedicationRecordSchema);
