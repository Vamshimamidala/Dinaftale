const mongoose = require('mongoose');

// Define the schema for the PDF documents
const documentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,   // Ensure that the name field is required
        unique: true,     // Enforce unique names for documents
    },
    text: {
        type: String,
        required: true,   // Ensure that the text field is required
    },
    fileUrl: {
        type: String,
        required: true,   // Store the URL where the generated PDF can be accessed
    },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically set to the current timestamp when the document is created
    },
});

// Create a Mongoose model using the schema
// Export the model to use it elsewhere in your app
 
module.exports = mongoose.model('Document', documentSchema);