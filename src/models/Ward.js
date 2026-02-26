const mongoose = require('mongoose');

const WardSchema = new mongoose.Schema(
  {
    wardName: {
      type: String,
      required: true,
      trim: true
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['general', 'ICU', 'CCU'],
      default: 'general'
    },
    totalBeds: {
      type: Number,
      required: true,
      min: 1
    },
    availableBeds: {
      type: Number,
      min: 0
    }
  },
  { timestamps: true }
);

WardSchema.index({ wardName: 1, department: 1 }, { unique: true });

WardSchema.pre('validate', function () {
  if (this.availableBeds === undefined || this.availableBeds === null) {
    this.availableBeds = this.totalBeds;
  }

  if (this.availableBeds > this.totalBeds) {
    this.invalidate('availableBeds', 'availableBeds cannot exceed totalBeds');
  }

  if (this.availableBeds < 0) {
    this.invalidate('availableBeds', 'availableBeds cannot be negative');
  }
});

module.exports = mongoose.model('Ward', WardSchema);
