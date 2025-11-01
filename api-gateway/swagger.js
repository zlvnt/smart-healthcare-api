const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Smart Healthcare System API',
      version: '1.0.0',
      description: 'API documentation for Smart Healthcare System - UTS IAE/Web Service Development',
      contact: {
        name: 'Healthcare Team'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server (API Gateway)'
      }
    ],
    tags: [
      {
        name: 'Patients',
        description: 'Patient management endpoints'
      },
      {
        name: 'Doctors',
        description: 'Doctor management endpoints'
      },
      {
        name: 'Appointments',
        description: 'Appointment management endpoints'
      },
      {
        name: 'Medical Records',
        description: 'Medical record management endpoints'
      }
    ],
    components: {
      schemas: {
        Patient: {
          type: 'object',
          required: ['name', 'birth_date', 'gender', 'phone'],
          properties: {
            _id: {
              type: 'string',
              description: 'Auto-generated patient ID'
            },
            name: {
              type: 'string',
              description: 'Patient full name',
              example: 'John Doe'
            },
            birth_date: {
              type: 'string',
              description: 'Birth date in YYYY-MM-DD format',
              example: '1990-05-15'
            },
            gender: {
              type: 'string',
              enum: ['male', 'female'],
              description: 'Patient gender',
              example: 'male'
            },
            phone: {
              type: 'string',
              description: 'Phone number',
              example: '081234567890'
            },
            address: {
              type: 'string',
              description: 'Full address',
              example: 'Jl. Merdeka No. 123, Jakarta'
            },
            blood_type: {
              type: 'string',
              enum: ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'],
              description: 'Blood type',
              example: 'A+'
            }
          }
        },
        Doctor: {
          type: 'object',
          required: ['name', 'specialization', 'phone'],
          properties: {
            _id: {
              type: 'string',
              description: 'Auto-generated doctor ID'
            },
            name: {
              type: 'string',
              description: 'Doctor name with title',
              example: 'Dr. Jane Smith, Sp.PD'
            },
            specialization: {
              type: 'string',
              description: 'Medical specialization',
              example: 'Cardiologist'
            },
            phone: {
              type: 'string',
              description: 'Phone number',
              example: '081234567891'
            },
            schedule: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Practice schedule',
              example: ['Monday 09:00-12:00', 'Wednesday 14:00-17:00']
            }
          }
        },
        Appointment: {
          type: 'object',
          required: ['patient_id', 'doctor_id', 'appointment_date'],
          properties: {
            _id: {
              type: 'string',
              description: 'Auto-generated appointment ID'
            },
            patient_id: {
              type: 'string',
              description: 'Reference to patient ID',
              example: '507f1f77bcf86cd799439011'
            },
            doctor_id: {
              type: 'string',
              description: 'Reference to doctor ID',
              example: '507f1f77bcf86cd799439012'
            },
            appointment_date: {
              type: 'string',
              description: 'Appointment date and time in YYYY-MM-DD HH:mm format',
              example: '2024-11-15 10:00'
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'completed', 'cancelled'],
              description: 'Appointment status',
              example: 'pending'
            },
            complaint: {
              type: 'string',
              description: 'Patient complaint',
              example: 'Chest pain and shortness of breath'
            }
          }
        },
        MedicalRecord: {
          type: 'object',
          required: ['patient_id', 'doctor_id', 'diagnosis'],
          properties: {
            _id: {
              type: 'string',
              description: 'Auto-generated record ID'
            },
            patient_id: {
              type: 'string',
              description: 'Reference to patient ID',
              example: '507f1f77bcf86cd799439011'
            },
            doctor_id: {
              type: 'string',
              description: 'Reference to doctor ID',
              example: '507f1f77bcf86cd799439012'
            },
            appointment_id: {
              type: 'string',
              description: 'Reference to appointment ID (optional)',
              example: '507f1f77bcf86cd799439013'
            },
            diagnosis: {
              type: 'string',
              description: 'Medical diagnosis',
              example: 'Acute coronary syndrome'
            },
            prescription: {
              type: 'string',
              description: 'Prescribed medication',
              example: 'Aspirin 100mg once daily, Atorvastatin 20mg once daily'
            },
            notes: {
              type: 'string',
              description: 'Additional notes',
              example: 'Patient advised to rest and follow up in 2 weeks'
            },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'Record creation date'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            error: {
              type: 'string',
              example: 'Detailed error description'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation successful'
            },
            data: {
              type: 'object'
            }
          }
        }
      }
    }
  },
  apis: ['./server.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
