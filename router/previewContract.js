const express = require('express');
const multer = require('multer');
const Contract = require('../modal/Previewcontract'); // Make sure the path is correct for your project

const router = express.Router();

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Set upload directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Unique filename
  },
});

const upload = multer({ storage });

// 1. Fetch Contract Details and Auto-Fill
router.get('/:id/fetch', async (req, res) => {
  try {
    const contract = await Contract.findOne({ contractId: req.params.id });
    if (!contract) return res.status(404).json({ message: 'Contract not found' });

    res.json({
      contractId: contract.contractId,
      tags: contract.tags, // Selected tags
      name: contract.name, // Auto-filled name
      contactNumber: contract.contactNumber, // Auto-filled contact number
      startDate: contract.startDate,
      endDate: contract.endDate,
      previewFileUrl: contract.previewFileUrl,
      additionalFiles: contract.additionalFiles || [],
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. Edit Contract Details
router.put('/:id/edit', async (req, res) => {
  try {
    const { tags, name, contactNumber, startDate, endDate } = req.body;

    const contract = await Contract.findOne({ contractId: req.params.id });
    if (!contract) return res.status(404).json({ message: 'Contract not found' });

    if (tags) contract.tags = tags;
    if (name) contract.name = name;
    if (contactNumber) contract.contactNumber = contactNumber;
    if (startDate) contract.startDate = startDate;
    if (endDate) contract.endDate = endDate;

    await contract.save();

    res.json({ message: 'Contract updated successfully', contract });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
