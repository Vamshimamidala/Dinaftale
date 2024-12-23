const mongoose = require('mongoose');

// Define the schema
const contractssSchema = new mongoose.Schema({
  contractId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  contactNumber: { type: String }, // Contact number for autofill
  tags: { type: [String], default: [] }, // Selected tags
  startDate: { type: Date },
  endDate: { type: Date },
  previewFileUrl: { type: String },
  additionalFiles: { type: [String], default: [] },
  isFinalized: { type: Boolean, default: false },

});

// Create the model
const Contract = mongoose.model('Contractss', contractssSchema);

module.exports = Contract;
