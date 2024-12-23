const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const User = require("../modal/EmailModal"); // Import the User model

// Route 1: Fetch contacts of a logged-in user
router.get("/contacts", async (req, res) => {
  try {
    const userId = req.query.userId; // Get user ID from query params
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const user = await User.findById(userId).select("contacts");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user.contacts); // Send the user's contacts as a response
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Route 2: Send an email to a selected contact
router.post("/send-email", async (req, res) => {
  const { userId, contactId, subject, message } = req.body;

  if (!userId || !contactId || !subject || !message) {
    return res
      .status(400)
      .json({ error: "User ID, contact ID, subject, and message are required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const contact = user.contacts.id(contactId);
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    // Configure Nodemailer using the user's email address
    const transporter = nodemailer.createTransport({
      service: "gmail", // Use your email service provider
      auth: {
        user: user.email, // Use the logged-in user's email as the sender
        pass: process.env.EMAIL_PASSWORD, // Your email password or app password
      },
    });

    const mailOptions = {
      from: user.email, // Set the sender's email to the user's email
      to: contact.email, // Contact's email
      subject: subject, // Subject entered by the user
      text: message, // Message entered by the user
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email try again later" });
  }
});

module.exports = router;
