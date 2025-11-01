const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ path: '../../.env' });

const Doctor = require('./models/Doctor');

const app = express();
const PORT = process.env.DOCTOR_PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  dbName: process.env.DB_NAME || 'healthcare_db'
})
  .then(() => console.log('✅ Doctor Service connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes

// GET all doctors
app.get('/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching doctors',
      error: error.message
    });
  }
});

// GET doctor by ID
app.get('/doctors/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      data: doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching doctor',
      error: error.message
    });
  }
});

// POST create new doctor
app.post('/doctors', async (req, res) => {
  try {
    const { name, specialization, phone, schedule } = req.body;

    const doctor = new Doctor({
      name,
      specialization,
      phone,
      schedule: schedule || []
    });

    await doctor.save();

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      data: doctor
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating doctor',
      error: error.message
    });
  }
});

// PUT update doctor
app.put('/doctors/:id', async (req, res) => {
  try {
    const { name, specialization, phone, schedule } = req.body;

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { name, specialization, phone, schedule },
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      message: 'Doctor updated successfully',
      data: doctor
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating doctor',
      error: error.message
    });
  }
});

// DELETE doctor
app.delete('/doctors/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      message: 'Doctor deleted successfully',
      data: doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting doctor',
      error: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'Doctor Service',
    status: 'running',
    port: PORT
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Doctor Service running on port ${PORT}`);
});
