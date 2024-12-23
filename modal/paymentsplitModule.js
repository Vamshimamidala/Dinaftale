const mongoose = require('mongoose');

const ContractsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  totalPayment: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('PaymentSplit', ContractsSchema);
