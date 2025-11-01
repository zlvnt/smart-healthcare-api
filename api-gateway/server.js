const express = require('express');
const cors = require('cors');
const axios = require('axios');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
require('dotenv').config({ path: '../.env' });

const app = express();
const PORT = process.env.GATEWAY_PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Service URLs
const PATIENT_SERVICE_URL = `http://localhost:${process.env.PATIENT_PORT || 3001}`;
const DOCTOR_SERVICE_URL = `http://localhost:${process.env.DOCTOR_PORT || 3002}`;
const APPOINTMENT_SERVICE_URL = `http://localhost:${process.env.APPOINTMENT_PORT || 3003}`;
const MEDICAL_RECORD_SERVICE_URL = `http://localhost:${process.env.MEDICAL_RECORD_PORT || 3004}`;

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ===== PATIENT SERVICE ROUTES =====

/**
 * @swagger
 * /api/patients:
 *   get:
 *     summary: Get all patients
 *     tags: [Patients]
 *     responses:
 *       200:
 *         description: List of all patients
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Patient'
 */
app.get('/api/patients', async (req, res) => {
  try {
    const response = await axios.get(`${PATIENT_SERVICE_URL}/patients`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error fetching patients',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/patients/{id}:
 *   get:
 *     summary: Get patient by ID
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Patient not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/api/patients/:id', async (req, res) => {
  try {
    const response = await axios.get(`${PATIENT_SERVICE_URL}/patients/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error fetching patient',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/patients:
 *   post:
 *     summary: Create new patient
 *     tags: [Patients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - birth_date
 *               - gender
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               birth_date:
 *                 type: string
 *                 example: 1990-05-15
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 example: male
 *               phone:
 *                 type: string
 *                 example: "081234567890"
 *               address:
 *                 type: string
 *                 example: Jl. Merdeka No. 123, Jakarta
 *               blood_type:
 *                 type: string
 *                 enum: [O+, A+, B+, AB+, O-, A-, B-, AB-]
 *                 example: A+
 *     responses:
 *       201:
 *         description: Patient created successfully
 *       400:
 *         description: Validation error
 */
app.post('/api/patients', async (req, res) => {
  try {
    const response = await axios.post(`${PATIENT_SERVICE_URL}/patients`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error creating patient',
      error: error.response?.data?.error || error.message
    });
  }
});

/**
 * @swagger
 * /api/patients/{id}:
 *   put:
 *     summary: Update patient
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               birth_date:
 *                 type: string
 *               gender:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               blood_type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Patient updated successfully
 *       404:
 *         description: Patient not found
 */
app.put('/api/patients/:id', async (req, res) => {
  try {
    const response = await axios.put(`${PATIENT_SERVICE_URL}/patients/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error updating patient',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/patients/{id}:
 *   delete:
 *     summary: Delete patient
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient deleted successfully
 *       404:
 *         description: Patient not found
 */
app.delete('/api/patients/:id', async (req, res) => {
  try {
    const response = await axios.delete(`${PATIENT_SERVICE_URL}/patients/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error deleting patient',
      error: error.message
    });
  }
});

// ===== DOCTOR SERVICE ROUTES =====

/**
 * @swagger
 * /api/doctors:
 *   get:
 *     summary: Get all doctors
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: List of all doctors
 */
app.get('/api/doctors', async (req, res) => {
  try {
    const response = await axios.get(`${DOCTOR_SERVICE_URL}/doctors`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error fetching doctors',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/doctors/{id}:
 *   get:
 *     summary: Get doctor by ID
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: Doctor details
 *       404:
 *         description: Doctor not found
 */
app.get('/api/doctors/:id', async (req, res) => {
  try {
    const response = await axios.get(`${DOCTOR_SERVICE_URL}/doctors/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error fetching doctor',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/doctors:
 *   post:
 *     summary: Create new doctor
 *     tags: [Doctors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - specialization
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 example: Dr. Jane Smith, Sp.PD
 *               specialization:
 *                 type: string
 *                 example: Cardiologist
 *               phone:
 *                 type: string
 *                 example: "081234567891"
 *               schedule:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Monday 09:00-12:00", "Wednesday 14:00-17:00"]
 *     responses:
 *       201:
 *         description: Doctor created successfully
 */
app.post('/api/doctors', async (req, res) => {
  try {
    const response = await axios.post(`${DOCTOR_SERVICE_URL}/doctors`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error creating doctor',
      error: error.response?.data?.error || error.message
    });
  }
});

/**
 * @swagger
 * /api/doctors/{id}:
 *   put:
 *     summary: Update doctor
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Doctor updated successfully
 */
app.put('/api/doctors/:id', async (req, res) => {
  try {
    const response = await axios.put(`${DOCTOR_SERVICE_URL}/doctors/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error updating doctor',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/doctors/{id}:
 *   delete:
 *     summary: Delete doctor
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Doctor deleted successfully
 */
app.delete('/api/doctors/:id', async (req, res) => {
  try {
    const response = await axios.delete(`${DOCTOR_SERVICE_URL}/doctors/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error deleting doctor',
      error: error.message
    });
  }
});

// ===== APPOINTMENT SERVICE ROUTES =====

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Get all appointments
 *     tags: [Appointments]
 *     responses:
 *       200:
 *         description: List of all appointments
 */
app.get('/api/appointments', async (req, res) => {
  try {
    const response = await axios.get(`${APPOINTMENT_SERVICE_URL}/appointments`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error fetching appointments',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     summary: Get appointment by ID
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment details
 */
app.get('/api/appointments/:id', async (req, res) => {
  try {
    const response = await axios.get(`${APPOINTMENT_SERVICE_URL}/appointments/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error fetching appointment',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Create new appointment
 *     description: Creates a new appointment with validation against Patient and Doctor services
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patient_id
 *               - doctor_id
 *               - appointment_date
 *             properties:
 *               patient_id:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               doctor_id:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439012"
 *               appointment_date:
 *                 type: string
 *                 example: "2024-11-15 10:00"
 *               complaint:
 *                 type: string
 *                 example: Chest pain and shortness of breath
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *       404:
 *         description: Patient or Doctor not found
 */
app.post('/api/appointments', async (req, res) => {
  try {
    const response = await axios.post(`${APPOINTMENT_SERVICE_URL}/appointments`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error creating appointment',
      error: error.response?.data?.message || error.message
    });
  }
});

/**
 * @swagger
 * /api/appointments/{id}/status:
 *   put:
 *     summary: Update appointment status
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, completed, cancelled]
 *                 example: confirmed
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
app.put('/api/appointments/:id/status', async (req, res) => {
  try {
    const response = await axios.put(`${APPOINTMENT_SERVICE_URL}/appointments/${req.params.id}/status`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error updating appointment status',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/appointments/{id}:
 *   delete:
 *     summary: Delete appointment
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment deleted successfully
 */
app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const response = await axios.delete(`${APPOINTMENT_SERVICE_URL}/appointments/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error deleting appointment',
      error: error.message
    });
  }
});

// ===== MEDICAL RECORD SERVICE ROUTES =====

/**
 * @swagger
 * /api/records:
 *   get:
 *     summary: Get all medical records
 *     tags: [Medical Records]
 *     responses:
 *       200:
 *         description: List of all medical records
 */
app.get('/api/records', async (req, res) => {
  try {
    const response = await axios.get(`${MEDICAL_RECORD_SERVICE_URL}/records`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error fetching medical records',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/records/{id}:
 *   get:
 *     summary: Get medical record by ID
 *     tags: [Medical Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Medical record details
 */
app.get('/api/records/:id', async (req, res) => {
  try {
    const response = await axios.get(`${MEDICAL_RECORD_SERVICE_URL}/records/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error fetching medical record',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/records/patient/{patientId}:
 *   get:
 *     summary: Get medical records by patient ID
 *     tags: [Medical Records]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: List of patient's medical records
 */
app.get('/api/records/patient/:patientId', async (req, res) => {
  try {
    const response = await axios.get(`${MEDICAL_RECORD_SERVICE_URL}/records/patient/${req.params.patientId}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error fetching patient records',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/records:
 *   post:
 *     summary: Create new medical record
 *     description: Creates a new medical record with validation against Patient, Doctor, and optionally Appointment services
 *     tags: [Medical Records]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patient_id
 *               - doctor_id
 *               - diagnosis
 *             properties:
 *               patient_id:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               doctor_id:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439012"
 *               appointment_id:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439013"
 *               diagnosis:
 *                 type: string
 *                 example: Acute coronary syndrome
 *               prescription:
 *                 type: string
 *                 example: Aspirin 100mg once daily, Atorvastatin 20mg once daily
 *               notes:
 *                 type: string
 *                 example: Patient advised to rest and follow up in 2 weeks
 *     responses:
 *       201:
 *         description: Medical record created successfully
 *       404:
 *         description: Patient, Doctor, or Appointment not found
 */
app.post('/api/records', async (req, res) => {
  try {
    const response = await axios.post(`${MEDICAL_RECORD_SERVICE_URL}/records`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error creating medical record',
      error: error.response?.data?.message || error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Healthcare System API Gateway',
    version: '1.0.0',
    documentation: `http://localhost:${PORT}/api-docs`,
    endpoints: {
      patients: `http://localhost:${PORT}/api/patients`,
      doctors: `http://localhost:${PORT}/api/doctors`,
      appointments: `http://localhost:${PORT}/api/appointments`,
      medical_records: `http://localhost:${PORT}/api/records`
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
  console.log(`📄 OpenAPI JSON: http://localhost:${PORT}/api-docs.json`);
});
