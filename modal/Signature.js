const mongoose = require('mongoose');

const signatureSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to a user (if needed)
        ref: 'User',
        required: false,
    },
    signatureType: {
        type: String,
        enum: ['drawn', 'uploaded'], // Valid types
        required: true,
    },
    signatureData: {
        type: String, // Can store base64 data (for drawn) or file path (for uploaded)
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Signature', signatureSchema);