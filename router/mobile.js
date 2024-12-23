//  // routes/otpRoutes.js
// const express = require('express');
// const bodyParser = require('body-parser');
// const dotenv = require('dotenv');
// const twilio = require('twilio');
// const jwt = require('jsonwebtoken');
// const Otp = require('../modal/otp');  // Import OTP model
// dotenv.config();
// const router = express.Router();
// router.use(bodyParser.json());

// // Constants
// const OTP_EXPIRY_TIME = 3 * 60 * 1000; // 3 minutes in milliseconds,
// const JWT_SECRET = '094bd2518f5a681a26a38b6ad4b91f8b6281c62b6acd5387f64c482b53c9f69a';

// // Twilio credentials from environment variables
// const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;

// // Validate Twilio credentials
// if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
//     console.error('Twilio credentials are missing in environment variables.');
//     process.exit(1); // Exit process if Twilio credentials are not set
// }
// const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// // Generate a 4-digit OTP
// const generateOTP = () => Math.floor(1000 + Math.random() * 9000);

// // Generate JWT Token for OTP
// const generateOTPToken = (mobileNumber, otp) => {
//     return jwt.sign(
//         {
//             mobileNumber,
//             otp,
//             exp: Math.floor(Date.now() / 1000) + OTP_EXPIRY_TIME / 1000, // Token expiration in seconds
//         },
//         JWT_SECRET
//     );
// };

// // Verify JWT Token
// const verifyOTPToken = (token) => {
//     try {
//         return jwt.verify(token, JWT_SECRET);
//     } catch (err) {
//         throw new Error('Invalid or expired token');
//     }
// };

// // API to send OTP
// router.post('/send-otp', async (req, res) => {
//     const { mobileNumber } = req.body;

//     // Validate input
//     if (!mobileNumber) {
//         return res.status(400).json({ message: 'Mobile number is required.' });
//     }

//     const otp = generateOTP();
//     const token = generateOTPToken(mobileNumber, otp);

//     try {
//         // Save OTP in the database with expiration time
//         const expiryTime = new Date(Date.now() + OTP_EXPIRY_TIME);
//         const otpEntry = new Otp({
//             mobileNumber,
//             otp,
//             expiryTime,
//         });
//         await otpEntry.save();

//         // Send OTP message via Twilio
//         await client.messages.create({
//             body: `Your OTP is ${otp}. It will expire in 3 minutes.`,
//             from: TWILIO_PHONE_NUMBER,
//             to: mobileNumber,
//         });

//         res.status(200).json({
//             message: 'OTP sent successfully.',
//             token, // Send token to client
//         });
//     } catch (error) {
//         console.error('Error sending OTP:', error);
//         res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
//     }
// });

// // API to verify OTP
// router.post('/verify-otp', async (req, res) => {
//     const { token, otp } = req.body;

//     // Validate input
//     if (!token || !otp) {
//         return res.status(400).json({ message: 'Token and OTP are required.' });
//     }

//     try {
//         const decoded = verifyOTPToken(token);

//         // Find OTP entry in the database
//         const otpEntry = await Otp.findOne({
//             mobileNumber: decoded.mobileNumber,
//             otp: decoded.otp,
//         });

//         if (!otpEntry) {
//             return res.status(400).json({ message: 'OTP not found or invalid.' });
//         }

//         // Check if OTP has expired
//         if (otpEntry.expiryTime < Date.now()) {
//             return res.status(400).json({ message: 'OTP has expired.' });
//         }

//         // Check if the OTP matches
//         if (otp !== decoded.otp.toString()) {
//             return res.status(400).json({ message: 'Invalid OTP.' });
//         }

//         // OTP verified successfully
//         res.status(200).json({ message: 'OTP verified successfully.' });

//         // Optionally, you can delete the OTP from the database after successful verification
//         await Otp.deleteOne({ _id: otpEntry._id });
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// });

// module.exports = router;
