const axios = require('axios');
const Appointment = require('../models/Appointment');

const PATIENT_SERVICE_URL = `http://patient-service:${process.env.PATIENT_PORT || 3001}`;
const DOCTOR_SERVICE_URL = `http://doctor-service:${process.env.DOCTOR_PORT || 3002}`;

// Validate patient exists via GraphQL
async function validatePatient(patientId) {
  try {
    const response = await axios.post(`${PATIENT_SERVICE_URL}/graphql`, {
      query: `{ patient(id: "${patientId}") { id name } }`
    });

    if (response.data.errors) {
      return null;
    }

    return response.data.data?.patient;
  } catch (error) {
    return null;
  }
}

// Validate doctor exists via GraphQL
async function validateDoctor(doctorId) {
  try {
    const response = await axios.post(`${DOCTOR_SERVICE_URL}/graphql`, {
      query: `{ doctor(id: "${doctorId}") { id name } }`
    });

    if (response.data.errors) {
      return null;
    }

    return response.data.data?.doctor;
  } catch (error) {
    return null;
  }
}

const resolvers = {
  Query: {
    // Get all appointments
    appointments: async () => {
      try {
        const appointments = await Appointment.find().sort({ createdAt: -1 });
        return appointments;
      } catch (error) {
        throw new Error(`Error fetching appointments: ${error.message}`);
      }
    },

    // Get appointment by ID
    appointment: async (_, { id }) => {
      try {
        const appointment = await Appointment.findById(id);
        if (!appointment) {
          throw new Error('Appointment not found');
        }
        return appointment;
      } catch (error) {
        throw new Error(`Error fetching appointment: ${error.message}`);
      }
    },

    // Get appointments by patient ID
    appointmentByPatient: async (_, { patientId }) => {
      try {
        const appointments = await Appointment.find({ patient_id: patientId });
        if (appointments.length === 0) {
          throw new Error('No appointments found for this patient');
        }
        return appointments;
      } catch (error) {
        throw new Error(`Error fetching appointments: ${error.message}`);
      }
    },

    // Get appointments by doctor ID
    appointmentByDoctor: async (_, { doctorId }) => {
      try {
        const appointments = await Appointment.find({ doctor_id: doctorId });
        if (appointments.length === 0) {
          throw new Error('No appointments found for this doctor');
        }
        return appointments;
      } catch (error) {
        throw new Error(`Error fetching appointments: ${error.message}`);
      }
    }
  },

  Mutation: {
    // Create appointment with validation
    createAppointment: async (_, { patient_id, doctor_id, appointment_date, complaint, status }) => {
      try {
        // Validate required fields
        if (!patient_id || !doctor_id || !appointment_date) {
          throw new Error('Missing required fields: patient_id, doctor_id, appointment_date');
        }

        // Validate patient exists
        const patient = await validatePatient(patient_id);
        if (!patient) {
          throw new Error('Patient not found');
        }

        // Validate doctor exists
        const doctor = await validateDoctor(doctor_id);
        if (!doctor) {
          throw new Error('Doctor not found');
        }

        // Validate status if provided
        const appointmentStatus = status || 'pending';
        if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(appointmentStatus)) {
          throw new Error('Invalid status. Must be: pending, confirmed, completed, or cancelled');
        }

        // Create appointment
        const appointment = new Appointment({
          patient_id,
          doctor_id,
          appointment_date,
          complaint: complaint || '',
          status: appointmentStatus
        });

        await appointment.save();
        return appointment;
      } catch (error) {
        throw new Error(`Error creating appointment: ${error.message}`);
      }
    },

    // Update appointment status
    updateAppointmentStatus: async (_, { id, status }) => {
      try {
        // Validate status
        if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
          throw new Error('Invalid status. Must be: pending, confirmed, completed, or cancelled');
        }

        const appointment = await Appointment.findByIdAndUpdate(
          id,
          { status },
          { new: true, runValidators: true }
        );

        if (!appointment) {
          throw new Error('Appointment not found');
        }

        return appointment;
      } catch (error) {
        throw new Error(`Error updating appointment: ${error.message}`);
      }
    },

    // Delete appointment
    deleteAppointment: async (_, { id }) => {
      try {
        const appointment = await Appointment.findByIdAndDelete(id);
        if (!appointment) {
          throw new Error('Appointment not found');
        }

        return {
          success: 'true',
          message: 'Appointment deleted successfully'
        };
      } catch (error) {
        throw new Error(`Error deleting appointment: ${error.message}`);
      }
    }
  }
};

module.exports = resolvers;
