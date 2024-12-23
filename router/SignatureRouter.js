const express = require('express');
const multer = require('multer');
const Signature = require('../modal/Signature'); // Import the schema
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Multer setup for handling uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// Save drawn signature (base64)
router.post('/draw', async (req, res) => {
    const { signature, userId } = req.body; // Signature is base64 data
    if (!signature) {
        return res.status(400).json({ error: 'Signature data is required' });
    }

    try {
        const signatureDoc = new Signature({
            userId,
            signatureType: 'drawn',
            signatureData: signature,
        });
        await signatureDoc.save();
        res.status(201).json({ message: 'Signature saved', signature: signatureDoc });
    } catch (error) {
        res.status(500).json({ error: 'Error saving signature' });
    }
});

// Save uploaded signature (file)
router.post('/upload', upload.single('signature'), async (req, res) => {
    const { userId } = req.body;

    if (!req.file) {
        return res.status(400).json({ error: 'File upload is required' });
    }

    try {
        const signatureDoc = new Signature({
            userId,
            signatureType: 'uploaded',
            signatureData: req.file.path, // Save the file path
        });
        await signatureDoc.save();
        res.status(201).json({ message: 'Signature uploaded', signature: signatureDoc });
    } catch (error) {
        res.status(500).json({ error: 'Error saving uploaded signature' });
    }
});

// Get all signatures for a user (optional)
router.get('/signatures/:id', async (req, res) => {
    const { userId } = req.params;

    try {
        const signatures = await Signature.find({ userId });
        res.status(200).json({ signatures });
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving signatures' });
    }
});

// Delete a signature
router.delete('/signatures/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const signature = await Signature.findById(id);
        if (!signature) {
            return res.status(404).json({ error: 'Signature not found' });
        }

        // If uploaded signature, remove the file from the server
        if (signature.signatureType === 'uploaded') {
            fs.unlinkSync(signature.signatureData); // Remove file from server
        }

        await Signature.findByIdAndDelete(id);
        res.status(200).json({ message: 'Signature deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting signature' });
    }
});

module.exports = router;