const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const User = require("../modal/EmailModal"); // Import the User model

// SMTP Configuration
const transporter = nodemailer.createTransport({
  host: "smtp.your-email-provider.com", // Replace with your SMTP host
  port: 587, // Use the SMTP port (587 for TLS, 465 for SSL)
  secure: false, // Set to true for SSL, otherwise false for TLS
  auth: {
    user: process.env.APP_EMAIL, // Application email (e.g., no-reply@example.com)
    pass: process.env.APP_EMAIL_PASSWORD, // Password or app password for the sender email
  },
});

// Route: Send an email to a selected contact
router.post("/send-email", async (req, res) => {
  const { userId, contactId, subject, message } = req.body;

  // Validate required fields
  if (!userId || !contactId || !subject || !message) {
    return res
      .status(400)
      .json({ error: "User ID, contact ID, subject, and message are required" });
  }

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find the contact by ID within the user's contacts
    const contact = user.contacts.id(contactId);
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    // Email details
    const mailOptions = {
      from: `"App Name" <${process.env.APP_EMAIL}>`, // Use the global application email
      to: contact.email, // Recipient's email (from user's contacts)
      subject: subject, // Email subject
      text: message, // Email body
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email. Try again later." });
  }
});

module.exports = router;
