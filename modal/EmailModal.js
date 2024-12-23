const mongoose = require("mongoose");

// Schema for individual contact
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Contact's name
  contactNumber: { type: String, required: true }, // Contact's phone number
  email: { type: String, required: true }, // Contact's email
});

// Schema for user
const userSchema = new mongoose.Schema({
  name: { type: String, required: true }, // User's name
  email: { type: String, required: true, unique: true }, // User's email
  contacts: [contactSchema], // Array of contacts associated with the user
});

// Export the model
module.exports = mongoose.model("User", userSchema);