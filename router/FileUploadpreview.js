const express = require('express');
const multer = require('multer');
const Contract = require('../modal/Previewcontract');
const User = require('../modal/User'); // Assuming a User model to fetch user details based on MIT ID

const router = express.Router();

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploadss/'); // Set upload directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Unique filename
  },
});

const upload = multer({ storage });

// 1. Fetch Contract Preview with Auto File Upload and Auto-fill
router.get('/:id/preview', upload.single('previewFile'), async (req, res) => {
  try {
    const contract = await Contract.findOne({ contractId: req.params.id });
    if (!contract) return res.status(404).json({ message: 'Contract not found' });

    // Auto-fill preview file if it doesn't exist
    if (!contract.previewFileUrl && req.file) {
      contract.previewFileUrl = req.file.path; // Associate the uploaded preview file
      await contract.save();
    }

    // Fetch user details based on MIT ID (assuming MIT ID is passed in the header)
    const mitId = req.headers['x-mit-id']; // MIT ID passed via header
    let userName = null;
    if (mitId) {
      const user = await User.findOne({ mitId }); // Look for the user in the database
      if (user) userName = user.name; // Extract the user's name
    }

    // Return the contract details with auto-filled values
    res.json({
      contractId: contract.contractId,
      tags: contract.tags, // Auto-fill tags
      name: contract.name,
      startDate: contract.startDate, // Auto-filled start date
      endDate: contract.endDate,     // Auto-filled end date
      previewFileUrl: contract.previewFileUrl,
      userName, // Auto-filled user name
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. Upload Additional Files Based on User Selection
router.post('/:id/upload', upload.single('file'), async (req, res) => {
  try {
    const contract = await Contract.findOne({ contractId: req.params.id });
    if (!contract) return res.status(404).json({ message: 'Contract not found' });

    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // Add uploaded file to contract's list of files
    if (!contract.additionalFiles) contract.additionalFiles = [];
    contract.additionalFiles.push(req.file.path); // Add file path or URL

    await contract.save();

    res.json({
      message: 'File uploaded successfully',
      fileUrl: req.file.path,
      additionalFiles: contract.additionalFiles,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
