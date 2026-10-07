const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    patientName: {
      type: String,
      required: [true, 'Please provide the patient name'],
      trim: true
    },
    bloodGroup: {
      type: String,
      required: [true, 'Please specify the needed blood group'],
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    unitsNeeded: {
      type: Number,
      required: [true, 'Please specify the number of blood units required'],
      min: [1, 'Must request at least 1 unit'],
      max: [10, 'Single request limit is 10 units'],
      default: 1
    },
    hospitalName: {
      type: String,
      required: [true, 'Please provide the hospital or medical facility name'],
      trim: true
    },
    hospitalAddress: {
      type: String,
      required: [true, 'Please provide the hospital address or landmark'],
      trim: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Hospital coordinates are required for geospatial donor discovery']
      }
    },
    urgency: {
      type: String,
      enum: ['CRITICAL', 'URGENT', 'STANDARD'],
      default: 'URGENT'
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'FULFILLED', 'CANCELLED'],
      default: 'PENDING'
    },
    contactPhone: {
      type: String,
      required: [true, 'Please provide an emergency contact phone number'],
      trim: true
    },
    notes: {
      type: String,
      default: ''
    },
    acceptedByDonor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DonorProfile',
      default: null
    },
    acceptedAt: {
      type: Date,
      default: null
    },
    fulfilledAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

bloodRequestSchema.index({ location: '2dsphere' });
bloodRequestSchema.index({ status: 1, urgency: 1, bloodGroup: 1 });

const BloodRequest = mongoose.model('BloodRequest', bloodRequestSchema);
module.exports = BloodRequest;
