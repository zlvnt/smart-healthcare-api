const Doctor = require('../models/Doctor');

const resolvers = {
  Query: {
    // Get all doctors
    doctors: async () => {
      try {
        const doctors = await Doctor.find().sort({ createdAt: -1 });
        return doctors;
      } catch (error) {
        throw new Error(`Error fetching doctors: ${error.message}`);
      }
    },

    // Get doctor by ID
    doctor: async (_, { id }) => {
      try {
        const doctor = await Doctor.findById(id);
        if (!doctor) {
          throw new Error('Doctor not found');
        }
        return doctor;
      } catch (error) {
        throw new Error(`Error fetching doctor: ${error.message}`);
      }
    },

    // Get doctors by specialization
    doctorBySpecialization: async (_, { specialization }) => {
      try {
        const doctors = await Doctor.find({ specialization: new RegExp(specialization, 'i') });
        if (doctors.length === 0) {
          throw new Error('No doctors found with that specialization');
        }
        return doctors;
      } catch (error) {
        throw new Error(`Error searching doctors: ${error.message}`);
      }
    }
  },

  Mutation: {
    // Create doctor
    createDoctor: async (_, { name, specialization, phone, schedule }) => {
      try {
        // Validation
        if (!name || !specialization || !phone) {
          throw new Error('Missing required fields: name, specialization, phone');
        }

        const doctor = new Doctor({
          name,
          specialization,
          phone,
          schedule: schedule || []
        });

        await doctor.save();
        return doctor;
      } catch (error) {
        throw new Error(`Error creating doctor: ${error.message}`);
      }
    },

    // Update doctor
    updateDoctor: async (_, { id, name, phone, schedule }) => {
      try {
        const doctor = await Doctor.findById(id);
        if (!doctor) {
          throw new Error('Doctor not found');
        }

        // Update fields if provided
        if (name) doctor.name = name;
        if (phone) doctor.phone = phone;
        if (schedule !== undefined) doctor.schedule = schedule;

        await doctor.save();
        return doctor;
      } catch (error) {
        throw new Error(`Error updating doctor: ${error.message}`);
      }
    },

    // Delete doctor
    deleteDoctor: async (_, { id }) => {
      try {
        const doctor = await Doctor.findByIdAndDelete(id);
        if (!doctor) {
          throw new Error('Doctor not found');
        }

        return {
          success: 'true',
          message: 'Doctor deleted successfully'
        };
      } catch (error) {
        throw new Error(`Error deleting doctor: ${error.message}`);
      }
    }
  }
};

module.exports = resolvers;
