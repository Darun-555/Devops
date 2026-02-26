const mongoose = require('mongoose');

const DoctorNoteSchema = new mongoose.Schema(
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
    diagnosis: {
      type: String,
      required: true,
      trim: true
    },
    treatment: {
      type: String,
      required: true,
      trim: true
    },
    prescription: {
      type: String,
      trim: true
    },
    progressNotes: {
      type: String,
      trim: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('DoctorNote', DoctorNoteSchema);
