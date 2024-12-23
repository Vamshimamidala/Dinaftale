// Modularizes contract-related APIs for cleaner code organization.
// Supports operations like fetching contracts, getting details by ID, and calculating payments.
const express = require('express');
const router = express.Router();
const Contract = require('../modal/paymentsplitModule'); // Import the Contract model

// API to get all contracts
router.get('/', async (req, res) => {
  try {
    const contracts = await Contract.find(); // Fetch all contracts from the database
    res.json(contracts);
  } catch (err) {
    res.status(500).json({ error: "Error fetching contracts" });
  }
});

// API to get contract details by ID
router.get('/:id', async (req, res) => {
  const contractId = req.params.id;

  try {
    const contract = await Contract.findById(contractId);// by the contract deatils it calclutae the payment

    if (!contract) {
      return res.status(404).json({ error: "Contract not found" });
    }

    res.json(contract);
  } catch (err) {
    res.status(500).json({ error: "Error fetching contract details" });
  }
});

// API to calculate payment based on selected option
router.post('/payment', async (req, res) => {
  const { contractId, selectedParty } = req.body;

  if (!contractId || !selectedParty) {
    return res.status(400).json({ error: "Missing required fields: contractId or selectedParty" });
  }

  try {
    const contract = await Contract.findById(contractId);

    if (!contract) {
      return res.status(404).json({ error: "Contract not found" });
    }

    const totalPayment = contract.totalPayment;
    let paymentDetails;

    switch (selectedParty) {
      case "Party1":
        paymentDetails = { Party1: totalPayment, Party2: 0 };
        break;
      case "Party2":
        paymentDetails = { Party1: 0, Party2: totalPayment };
        break;
      case "Split":
        const splitAmount = totalPayment / 2;
        paymentDetails = { Party1: splitAmount, Party2: splitAmount };
        break;
      default:
        return res.status(400).json({ error: "Invalid party selection. Options are: Party1, Party2, or Split." });
    }

    res.json({ contractId, totalPayment, paymentDetails });
  } catch (err) {
    res.status(500).json({ error: "Error processing payment" });
  }
});

module.exports = router;
