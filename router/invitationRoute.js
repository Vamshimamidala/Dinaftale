const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');

// Twilio configuration
const TWILIO_ACCOUNT_SID = 'your_account_sid';
const TWILIO_AUTH_TOKEN = 'your_auth_token';
const TWILIO_PHONE_NUMBER = 'your_twilio_number';

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const app = express();
app.use(bodyParser.json());

// Simulated database of registered users
const registeredUsers = [
    { phoneNumber: '+4512345678' }, // Add registered phone numbers
    { phoneNumber: '+4598765432' }
];

// API to check and send invitations from contacts
app.post('/send-invitations', async (req, res) => {
    const { contacts } = req.body; // `contacts` should be an array of phone numbers

    if (!Array.isArray(contacts) || contacts.length === 0) {
        return res.status(400).json({ message: 'Contacts must be a non-empty array.' });
    }

    const results = [];

    for (const phoneNumber of contacts) {
        // Check if the phone number exists in the database
        const userExists = registeredUsers.some(user => user.phoneNumber === phoneNumber);

        if (userExists) {
            results.push({ phoneNumber, status: 'User already registered.' });
        } else {
            // Generate invitation link
            const invitationLink = `https://example.com/invite?phone=${encodeURIComponent(phoneNumber)}`;
            const message = `Vi kan desværre ikke finde nogen DinAftale-brugere med dette telefonnummer. Du kan invitere din kontakt til appen via invitationslinket nedenfor: ${invitationLink}`;

            try {
                // Send SMS
                await client.messages.create({
                    body: message,
                    from: TWILIO_PHONE_NUMBER,
                    to: phoneNumber
                });

                results.push({ phoneNumber, status: 'Invitation sent.', link: invitationLink });
            } catch (error) {
                console.error(`Failed to send SMS to ${phoneNumber}:`, error.message);
                results.push({ phoneNumber, status: 'Failed to send invitation.', error: error.message });
            }
        }
    }

    res.status(200).json({ message: 'Process completed.', results });
});



