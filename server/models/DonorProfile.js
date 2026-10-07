const mongoose = require('mongoose');

const donorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    bloodGroup: {
      type: String,
      required: [true, 'Please select your blood group'],
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Location coordinates are required for emergency matching']
      }
    },
    addressLocality: {
      type: String,
      default: 'City Center',
      trim: true
    },
    lastDonationDate: {
      type: Date,
      default: null
    },
    totalDonations: {
      type: Number,
      default: 0
    },
    eligibilityStatus: {
      type: String,
      enum: ['ELIGIBLE', 'DEFERRED', 'REST_PERIOD'],
      default: 'ELIGIBLE'
    }
  },
  {
    timestamps: true
  }
);

// Crucial 2dsphere index for MongoDB geospatial queries ($geoNear / $near)
donorProfileSchema.index({ location: '2dsphere' });
donorProfileSchema.index({ bloodGroup: 1, isAvailable: 1 });

const DonorProfile = mongoose.model('DonorProfile', donorProfileSchema);
module.exports = DonorProfile;
