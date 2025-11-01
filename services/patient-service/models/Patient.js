const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true
  },
  birth_date: {
    type: String,
    required: [true, 'Birth date is required'],
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Birth date must be in format YYYY-MM-DD']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['male', 'female']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  blood_type: {
    type: String,
    enum: ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-', ''],
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Patient', patientSchema);
