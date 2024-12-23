/// i need time stamp and if the sigunare and payment was not done i need pending state
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Contract = require('../modal/DateModal'); // Corrected the model import

// JWT Secret Key (use a more secure method in production)
const JWT_SECRET = '024bd2518f5a641a27a38b6ad4b91f8b6281c62b6acd5387f64c482b53c9f69a';

// Helper function to generate JWT token with contract expiration based on the contract's end date
function generateContractToken(contract) {
    const expirationDate = contract.endDate;
    // Set expiration time based on the contract's end date
    return jwt.sign(
        { contractId: contract._id, exp: Math.floor(expirationDate.getTime() / 1000) },
        JWT_SECRET
    );
}

// Middleware to verify JWT Token
function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];  // Get the token from header

    if (!token) {
        return res.status(403).json({ message: 'Token not provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token', error: err.message });
        }
        req.user = decoded;  // Attach decoded token to the request object
        next();  // Continue to the next middleware or route handler
    });
}

// API to create a new contract
router.post('/create-contract', async (req, res) => {
    try {
        const { id, startDate, endDate, lastSigningDate } = req.body;

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start) || isNaN(end)) {
            return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
        }

        if (start >= end) {
            return res.status(400).json({
                message: 'Contract start date must be earlier than the end date of the contract.'
            });
        }

        // If lastSigningDate is provided, use it; otherwise, set it to null
        const signingDate = lastSigningDate ? new Date(lastSigningDate) : null;

        const contract = new Contract({
            id,
            startDate: start,
            endDate: end,
            lastSigningDate: signingDate,
        });

        await contract.save();

        const token = generateContractToken(contract);

        res.status(201).json({ message: 'Contract created successfully.', contract, token });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});
// API to fetch all contracts
router.get('/get-all-contracts', async (req, res) => {
    try {
        // Fetch all contracts from the database
        const contracts = await Contract.find();

        if (contracts.length === 0) {
            return res.status(404).json({ message: 'No contracts found.' });
        }

        res.status(200).json({ message: 'Contracts fetched successfully.', contracts });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});


// API to update the last date for signing the contract by unique ID
router.post('/update-last-signing-date/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { lastSigningDate } = req.body;

        if (req.user.contractId !== id) {
            return res.status(403).json({ message: 'Unauthorized to update this contract.' });
        }

        const signing = new Date(lastSigningDate);
        if (isNaN(signing)) {
            return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
        }

        const contract = await Contract.findById(id);
        if (!contract) {
            return res.status(404).json({ message: 'Contract not found.' });
        }

        const start = new Date(contract.startDate);
        const end = new Date(contract.endDate);

        if (signing < start || signing > end) {
            return res.status(400).json({
                message: 'Last date for signing must be between the contract start date and end date.'
            });
        }

        contract.lastSigningDate = signing;
        await contract.save();

        res.status(200).json({
            message: 'Last signing date updated successfully.',
            contract
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

// API to fetch the last signing date of a contract
router.get('/get-last-signing-date/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the contract exists
        const contract = await Contract.findById(id);
        if (!contract) {
            return res.status(404).json({ message: 'Contract not found.' });
        }

        const contractExpired = req.user.exp * 1000 < Date.now();
        if (contractExpired) {
            return res.status(400).json({ message: 'Contract has expired.' });
        }

        if (!contract.lastSigningDate) {
            return res.status(200).json({
                message: 'Last signing date not set for this contract.',
                lastSigningDate: null
            });
        }

        res.status(200).json({
            message: 'Last signing date fetched successfully.',
            lastSigningDate: contract.lastSigningDate
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});
// API to fetch contracts where lastSigningDate is not filled (pending contracts)
router.get('/contracts-without-signing-date', async (req, res) => {
    try {
        const contracts = await Contract.find({ lastSigningDate: null });

        if (contracts.length === 0) {
            return res.status(404).json({ message: 'No pending contracts found.' });
        }

        res.status(200).json({ contracts });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

// API to fetch all expired contracts
router.get('/expired-contracts', async (req, res) => {
    try {
        const today = new Date();
        // Set time to 00:00:00 to compare only the date part
        today.setHours(0, 0, 0, 0);

        // Find contracts where endDate is strictly before today (no time part)
        const expiredContracts = await Contract.find({ endDate: { $lt: today } });

        if (expiredContracts.length === 0) {
            return res.status(404).json({ message: 'No expired contracts found.' });
        }

        res.status(200).json({ expiredContracts });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

// API to fetch all active contracts
router.get('/active-contracts', async (req, res) => {
    try {
        const today = new Date();
        const activeContracts = await Contract.find({ endDate: { $gte: today } });

        res.status(200).json({ activeContracts });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

 

module.exports = router;
