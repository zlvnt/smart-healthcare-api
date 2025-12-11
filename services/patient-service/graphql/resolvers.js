const Patient = require('../models/Patient');

const resolvers = {
  Query: {
    // Get all patients
    patients: async () => {
      try {
        const patients = await Patient.find().sort({ createdAt: -1 });
        return patients;
      } catch (error) {
        throw new Error(`Error fetching patients: ${error.message}`);
      }
    },

    // Get patient by ID
    patient: async (_, { id }) => {
      try {
        const patient = await Patient.findById(id);
        if (!patient) {
          throw new Error('Patient not found');
        }
        return patient;
      } catch (error) {
        throw new Error(`Error fetching patient: ${error.message}`);
      }
    },

    // Get patient by name
    patientByName: async (_, { name }) => {
      try {
        const patients = await Patient.find({ name: new RegExp(name, 'i') });
        if (patients.length === 0) {
          throw new Error('No patients found with that name');
        }
        return patients;
      } catch (error) {
        throw new Error(`Error searching patients: ${error.message}`);
      }
    }
  },

  Mutation: {
    // Create patient
    createPatient: async (_, { name, birth_date, gender, phone, address, blood_type }) => {
      try {
        // Validation
        if (!name || !birth_date || !gender || !phone) {
          throw new Error('Missing required fields: name, birth_date, gender, phone');
        }

        const patient = new Patient({
          name,
          birth_date,
          gender,
          phone,
          address: address || '',
          blood_type: blood_type || ''
        });

        await patient.save();
        return patient;
      } catch (error) {
        throw new Error(`Error creating patient: ${error.message}`);
      }
    },

    // Update patient
    updatePatient: async (_, { id, name, phone, address, blood_type }) => {
      try {
        const patient = await Patient.findById(id);
        if (!patient) {
          throw new Error('Patient not found');
        }

        // Update fields if provided
        if (name) patient.name = name;
        if (phone) patient.phone = phone;
        if (address !== undefined) patient.address = address;
        if (blood_type !== undefined) patient.blood_type = blood_type;

        await patient.save();
        return patient;
      } catch (error) {
        throw new Error(`Error updating patient: ${error.message}`);
      }
    },

    // Delete patient
    deletePatient: async (_, { id }) => {
      try {
        const patient = await Patient.findByIdAndDelete(id);
        if (!patient) {
          throw new Error('Patient not found');
        }

        return {
          success: 'true',
          message: 'Patient deleted successfully'
        };
      } catch (error) {
        throw new Error(`Error deleting patient: ${error.message}`);
      }
    }
  }
};

module.exports = resolvers;
