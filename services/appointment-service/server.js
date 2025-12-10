const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config({ path: '../../.env' });

const Appointment = require('./models/Appointment');

const app = express();
const PORT = process.env.APPOINTMENT_PORT || 3003;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  dbName: process.env.DB_NAME || 'healthcare_db'
})
  .then(() => console.log('Appointment Service connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PATIENT_SERVICE_URL = `http://localhost:${process.env.PATIENT_PORT || 3001}`;
const DOCTOR_SERVICE_URL = `http://localhost:${process.env.DOCTOR_PORT || 3002}`;

// validate patient
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

// validate doctor
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

// GET all appointments
app.get('/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: error.message
    });
  }
});

// GET appointment by ID
app.get('/appointments/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appointment',
      error: error.message
    });
  }
});

// POST create new appointment (with validation)
app.post('/appointments', async (req, res) => {
  try {
    const { patient_id, doctor_id, appointment_date, complaint, status } = req.body;

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

    // Validate status if provided
    const appointmentStatus = status || 'pending';
    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(appointmentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: pending, confirmed, completed, or cancelled'
      });
    }

    // Create appointment
    const appointment = new Appointment({
      patient_id,
      doctor_id,
      appointment_date,
      complaint,
      status: appointmentStatus
    });

    await appointment.save();

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating appointment',
      error: error.message
    });
  }
});

// PUT update appointment (full update)
app.put('/appointments/:id', async (req, res) => {
  try {
    const { patient_id, doctor_id, appointment_date, complaint, status } = req.body;
    const updateData = {};

    if (patient_id !== undefined) updateData.patient_id = patient_id;
    if (doctor_id !== undefined) updateData.doctor_id = doctor_id;
    if (appointment_date !== undefined) updateData.appointment_date = appointment_date;
    if (complaint !== undefined) updateData.complaint = complaint;
    if (status !== undefined) {
      if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be: pending, confirmed, completed, or cancelled'
        });
      }
      updateData.status = status;
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: appointment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating appointment',
      error: error.message
    });
  }
});

// PUT update appointment status
app.put('/appointments/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: pending, confirmed, completed, or cancelled'
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      data: appointment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating appointment status',
      error: error.message
    });
  }
});

// DELETE appointment
app.delete('/appointments/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      message: 'Appointment deleted successfully',
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting appointment',
      error: error.message
    });
  }
});

app.get('/health', (req, res) => {
  res.json({
    service: 'Appointment Service',
    status: 'running',
    port: PORT
  });
});

app.listen(PORT, () => {
  console.log(`Appointment Service running on port ${PORT}`);
});
