require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const patientRoutes = require('./routes/patientRoutes');

const app = express();
app.use(bodyParser.json());

// Database Connection
const dbURI = process.env.MONGO_URI;

mongoose.connect(dbURI)
  .then(() => console.log('✅ Connected to MongoDB Atlas (Cloud)'))
  .catch(err => console.log('❌ DB Connection Error:', err));

// Routes
app.use('/api/patients', patientRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});