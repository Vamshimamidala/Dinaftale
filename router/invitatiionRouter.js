// routes/invitation.js
const express = require('express');
const router = express.Router();
const User = require('../modal/invitation'); // Import User model
const twilio = require('twilio');
require('dotenv').config();

// Twilio client setup
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// POST /send-invitation - Check and send SMS if not registered
router.post('/send-invitation', async (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        return res.status(400).json({ message: 'Phone number is required.' });
    }

    try {
        // Check if phone number exists in the database
        const userExists = await User.findOne({ phoneNumber });

        if (userExists) {
            return res.status(200).json({ message: 'User already registered.' });
        }

        // Generate invitation link
        const invitationLink = `https://reset2.onrender.com/invite?phone=${encodeURIComponent(phoneNumber)}`;
        const message = `Vi kan desværre ikke finde nogen DinAftale-brugere med dette telefonnummer. Du kan invitere din kontakt til appen via invitationslinket nedenfor: ${invitationLink}`;

        // Send SMS
        await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber
        });

        res.status(200).json({ message: 'Invitation sent successfully.', link: invitationLink });
    } catch (error) {
        console.error('Error processing request:', error.message);
        res.status(500).json({ message: 'An error occurred.', error: error.message });
    }
});

module.exports = router;
