const express = require('express');
const mongoose = require('mongoose');
// const otpRoutes = require('./router/mobile'); // otp routes
 const document = require('./router/DocumentationRouter'); // document routes
 const Date = require('./router/DateRouter'); // document routes
 const Signature = require('./router/SignatureRouter'); // Signature routes
 const Paymentsplit = require('./router/paymentsplitRouter'); // Signature routes
 const EmailsendRouter = require('./router/EmailsendRouter'); // Signature routes
 const previewContract = require('./router/previewContract'); // Contract edit& preview routes
const app = express();
const port = 3000;

app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/Dinaftale').then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

// Use the routes
// app.use(otpRoutes);
app.use(document)
app.use(Date)
app.use(Signature)
app.use(Paymentsplit)
app.use(EmailsendRouter)
app.use(previewContract)

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
