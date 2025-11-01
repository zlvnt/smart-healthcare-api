const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ path: '../../.env' });

const Patient = require('./models/Patient');

const app = express();
const PORT = process.env.PATIENT_PORT || 3001;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  dbName: process.env.DB_NAME || 'healthcare_db'
})
  .then(() => console.log('Patient Service connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// GET all patients
app.get('/patients', async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching patients',
      error: error.message
    });
  }
});

// GET patient by ID
app.get('/patients/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching patient',
      error: error.message
    });
  }
});

// POST create new patient
app.post('/patients', async (req, res) => {
  try {
    const { name, birth_date, gender, phone, address, blood_type } = req.body;

    const patient = new Patient({
      name,
      birth_date,
      gender,
      phone,
      address,
      blood_type: blood_type || ''
    });

    await patient.save();

    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      data: patient
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating patient',
      error: error.message
    });
  }
});

// PUT update patient
app.put('/patients/:id', async (req, res) => {
  try {
    const { name, birth_date, gender, phone, address, blood_type } = req.body;

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { name, birth_date, gender, phone, address, blood_type },
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      message: 'Patient updated successfully',
      data: patient
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating patient',
      error: error.message
    });
  }
});

// DELETE patient
app.delete('/patients/:id', async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      message: 'Patient deleted successfully',
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting patient',
      error: error.message
    });
  }
});

app.get('/health', (req, res) => {
  res.json({
    service: 'Patient Service',
    status: 'running',
    port: PORT
  });
});

app.listen(PORT, () => {
  console.log(`Patient Service running on port ${PORT}`);
});
