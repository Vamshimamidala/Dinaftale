const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    lastSigningDate: { type: Date },
     
},  );

module.exports = mongoose.model('Contract', contractSchema);
