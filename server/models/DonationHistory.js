const mongoose = require('mongoose');

const donationHistorySchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DonorProfile',
      required: true
    },
    donorUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest',
      required: true
    },
    patientName: {
      type: String,
      required: true
    },
    bloodGroup: {
      type: String,
      required: true
    },
    unitsDonated: {
      type: Number,
      default: 1
    },
    hospitalName: {
      type: String,
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      default: 'Successful donation recorded.'
    }
  },
  {
    timestamps: true
  }
);

donationHistorySchema.index({ donorUser: 1, completedAt: -1 });

const DonationHistory = mongoose.model('DonationHistory', donationHistorySchema);
module.exports = DonationHistory;
