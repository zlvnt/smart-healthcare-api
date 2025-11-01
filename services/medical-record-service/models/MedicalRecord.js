const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patient_id: {
    type: String,
    required: [true, 'Patient ID is required']
  },
  doctor_id: {
    type: String,
    required: [true, 'Doctor ID is required']
  },
  appointment_id: {
    type: String
  },
  diagnosis: {
    type: String,
    required: [true, 'Diagnosis is required'],
    trim: true
  },
  prescription: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
