const mongoose = require('mongoose');

const AdmissionSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    wardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ward',
      required: true
    },
    admittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    admissionDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['admitted', 'discharged'],
      default: 'admitted'
    },
    dischargeDate: {
      type: Date
    },
    dischargeSummary: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

AdmissionSchema.index({ patientId: 1, status: 1 });

module.exports = mongoose.model('Admission', AdmissionSchema);
