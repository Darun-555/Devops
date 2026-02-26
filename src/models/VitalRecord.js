const mongoose = require('mongoose');

const VitalRecordSchema = new mongoose.Schema(
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
    temperature: {
      type: Number,
      required: true
    },
    bloodPressure: {
      type: String,
      required: true,
      trim: true
    },
    pulseRate: {
      type: Number,
      required: true
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

module.exports = mongoose.model('VitalRecord', VitalRecordSchema);
