const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient_id: {
    type: String,
    required: [true, 'Patient ID is required']
  },
  doctor_id: {
    type: String,
    required: [true, 'Doctor ID is required']
  },
  appointment_date: {
    type: String,
    required: [true, 'Appointment date is required'],
    match: [/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/, 'Appointment date must be in format YYYY-MM-DD HH:mm']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  complaint: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);
