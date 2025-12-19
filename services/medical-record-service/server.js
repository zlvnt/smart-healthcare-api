const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config({ path: '../../.env' });

const MedicalRecord = require('./models/MedicalRecord');

const app = express();
const PORT = process.env.MEDICAL_RECORD_PORT || 3004;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  dbName: 'healthcare_medical_db'
})
  .then(() => console.log('Medical Record Service connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PATIENT_SERVICE_URL = `http://patient-service:${process.env.PATIENT_PORT || 3001}`;
const DOCTOR_SERVICE_URL = `http://doctor-service:${process.env.DOCTOR_PORT || 3002}`;
const APPOINTMENT_SERVICE_URL = `http://appointment-service:${process.env.APPOINTMENT_PORT || 3003}`;
async function validatePatient(patientId) {
  try {
    const response = await axios.get(`${PATIENT_SERVICE_URL}/patients/${patientId}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
}

async function validateDoctor(doctorId) {
  try {
    const response = await axios.get(`${DOCTOR_SERVICE_URL}/doctors/${doctorId}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
}

async function validateAppointment(appointmentId) {
  try {
    const response = await axios.get(`${APPOINTMENT_SERVICE_URL}/appointments/${appointmentId}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
}

// GET all medical records
app.get('/records', async (req, res) => {
  try {
    const records = await MedicalRecord.find().sort({ date: -1 });
    res.json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching medical records',
      error: error.message
    });
  }
});

// GET medical record by ID
app.get('/records/:id', async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching medical record',
      error: error.message
    });
  }
});

// GET medical records by patient ID
app.get('/records/patient/:patientId', async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patient_id: req.params.patientId }).sort({ date: -1 });

    res.json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching patient records',
      error: error.message
    });
  }
});

// POST create new medical record (with validation)
app.post('/records', async (req, res) => {
  try {
    const { patient_id, doctor_id, appointment_id, diagnosis, prescription, notes } = req.body;

    // Validate patient exists
    const patient = await validatePatient(patient_id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Validate doctor exists
    const doctor = await validateDoctor(doctor_id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Validate appointment if provided (optional)
    if (appointment_id) {
      const appointment = await validateAppointment(appointment_id);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }
    }

    // Create medical record
    const record = new MedicalRecord({
      patient_id,
      doctor_id,
      appointment_id,
      diagnosis,
      prescription,
      notes
    });

    await record.save();

    res.status(201).json({
      success: true,
      message: 'Medical record created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating medical record',
      error: error.message
    });
  }
});

app.get('/health', (req, res) => {
  res.json({
    service: 'Medical Record Service',
    status: 'running',
    port: PORT
  });
});

app.listen(PORT, () => {
  console.log(`Medical Record Service running on port ${PORT}`);
});
