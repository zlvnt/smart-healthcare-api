# Smart Healthcare System - Technical Documentation

Dokumentasi lengkap untuk bagian yang dikerjakan: Appointment Service, Medical Record Service, API Gateway, dan Frontend.

---

## 📌 Table of Contents

1. [Appointment Service](#appointment-service)
2. [Medical Record Service](#medical-record-service)
3. [API Gateway](#api-gateway)
4. [Swagger Documentation](#swagger-documentation)
5. [Frontend Dashboard](#frontend-dashboard)
6. [Testing Guide](#testing-guide)

---

## 1. Appointment Service

### Overview
Service untuk manajemen janji temu (appointment) antara pasien dan dokter. Berfungsi sebagai **Provider & Consumer** karena melakukan validasi ke Patient Service dan Doctor Service.

### Port
`3003`

### Dependencies
```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.0",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "axios": "^1.6.0"
}
```

### Database Schema (Collection: appointments)
```javascript
{
  patient_id: String (required),
  doctor_id: String (required),
  appointment_date: String (required, format: "YYYY-MM-DD HH:mm"),
  status: String (enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending'),
  complaint: String,
  timestamps: true
}
```

### API Endpoints

#### 1. GET /appointments
**Fungsi:** Mengambil semua data appointment

**Response Success (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "patient_id": "507f1f77bcf86cd799439012",
      "doctor_id": "507f1f77bcf86cd799439013",
      "appointment_date": "2024-11-15 10:00",
      "status": "pending",
      "complaint": "Chest pain",
      "createdAt": "2024-10-31T08:00:00.000Z"
    }
  ]
}
```

#### 2. GET /appointments/:id
**Fungsi:** Mengambil appointment berdasarkan ID

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "patient_id": "507f1f77bcf86cd799439012",
    "doctor_id": "507f1f77bcf86cd799439013",
    "appointment_date": "2024-11-15 10:00",
    "status": "pending",
    "complaint": "Chest pain"
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Appointment not found"
}
```

#### 3. POST /appointments
**Fungsi:** Membuat appointment baru dengan validasi ke Patient & Doctor Service

**Request Body:**
```json
{
  "patient_id": "507f1f77bcf86cd799439012",
  "doctor_id": "507f1f77bcf86cd799439013",
  "appointment_date": "2024-11-15 10:00",
  "complaint": "Chest pain and shortness of breath"
}
```

**Flow Validasi:**
1. Terima request dengan `patient_id` dan `doctor_id`
2. Call `GET http://localhost:3001/patients/{patient_id}` untuk validasi patient
3. Call `GET http://localhost:3002/doctors/{doctor_id}` untuk validasi doctor
4. Jika salah satu tidak ditemukan, return 404
5. Jika kedua valid, simpan appointment ke database

**Response Success (201):**
```json
{
  "success": true,
  "message": "Appointment created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "patient_id": "507f1f77bcf86cd799439012",
    "doctor_id": "507f1f77bcf86cd799439013",
    "appointment_date": "2024-11-15 10:00",
    "status": "pending",
    "complaint": "Chest pain and shortness of breath"
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Patient not found"
}
```
atau
```json
{
  "success": false,
  "message": "Doctor not found"
}
```

#### 4. PUT /appointments/:id/status
**Fungsi:** Update status appointment

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Valid Status:**
- `pending`
- `confirmed`
- `completed`
- `cancelled`

**Response Success (200):**
```json
{
  "success": true,
  "message": "Appointment status updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "confirmed"
  }
}
```

#### 5. DELETE /appointments/:id
**Fungsi:** Hapus appointment

**Response Success (200):**
```json
{
  "success": true,
  "message": "Appointment deleted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011"
  }
}
```

### Inter-Service Communication Code

**Helper Function untuk Validasi Patient:**
```javascript
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
```

**Helper Function untuk Validasi Doctor:**
```javascript
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
```

---

## 2. Medical Record Service

### Overview
Service untuk manajemen rekam medis pasien. Berfungsi sebagai **Consumer** karena melakukan validasi ke 3 services: Patient, Doctor, dan Appointment.

### Port
`3004`

### Dependencies
```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.0",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "axios": "^1.6.0"
}
```

### Database Schema (Collection: medical_records)
```javascript
{
  patient_id: String (required),
  doctor_id: String (required),
  appointment_id: String (optional),
  diagnosis: String (required),
  prescription: String,
  notes: String,
  date: Date (default: Date.now),
  timestamps: true
}
```

### API Endpoints

#### 1. GET /records
**Fungsi:** Mengambil semua medical records

**Response Success (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "patient_id": "507f1f77bcf86cd799439012",
      "doctor_id": "507f1f77bcf86cd799439013",
      "appointment_id": "507f1f77bcf86cd799439011",
      "diagnosis": "Acute coronary syndrome",
      "prescription": "Aspirin 100mg once daily",
      "notes": "Follow up in 2 weeks",
      "date": "2024-10-31T08:00:00.000Z"
    }
  ]
}
```

#### 2. GET /records/:id
**Fungsi:** Mengambil medical record berdasarkan ID

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "patient_id": "507f1f77bcf86cd799439012",
    "diagnosis": "Acute coronary syndrome",
    "prescription": "Aspirin 100mg once daily"
  }
}
```

#### 3. GET /records/patient/:patientId
**Fungsi:** Mengambil semua medical records dari satu pasien

**Response Success (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "patient_id": "507f1f77bcf86cd799439012",
      "diagnosis": "Acute coronary syndrome",
      "date": "2024-10-31T08:00:00.000Z"
    }
  ]
}
```

#### 4. POST /records
**Fungsi:** Membuat medical record baru dengan validasi ke Patient, Doctor, dan Appointment Service

**Request Body:**
```json
{
  "patient_id": "507f1f77bcf86cd799439012",
  "doctor_id": "507f1f77bcf86cd799439013",
  "appointment_id": "507f1f77bcf86cd799439011",
  "diagnosis": "Acute coronary syndrome",
  "prescription": "Aspirin 100mg once daily, Atorvastatin 20mg once daily",
  "notes": "Patient advised to rest and follow up in 2 weeks"
}
```

**Flow Validasi:**
1. Terima request dengan `patient_id`, `doctor_id`, dan optional `appointment_id`
2. Call `GET http://localhost:3001/patients/{patient_id}` untuk validasi patient
3. Call `GET http://localhost:3002/doctors/{doctor_id}` untuk validasi doctor
4. Jika `appointment_id` ada, call `GET http://localhost:3003/appointments/{appointment_id}` untuk validasi
5. Jika ada yang tidak valid, return 404
6. Jika semua valid, simpan medical record ke database

**Response Success (201):**
```json
{
  "success": true,
  "message": "Medical record created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "patient_id": "507f1f77bcf86cd799439012",
    "doctor_id": "507f1f77bcf86cd799439013",
    "diagnosis": "Acute coronary syndrome",
    "prescription": "Aspirin 100mg once daily",
    "date": "2024-10-31T08:00:00.000Z"
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Patient not found"
}
```
atau
```json
{
  "success": false,
  "message": "Doctor not found"
}
```
atau
```json
{
  "success": false,
  "message": "Appointment not found"
}
```

### Inter-Service Communication

Medical Record Service berkomunikasi dengan **3 services**:

**1. Patient Service Validation:**
```javascript
const patient = await validatePatient(patient_id);
if (!patient) {
  return res.status(404).json({
    success: false,
    message: 'Patient not found'
  });
}
```

**2. Doctor Service Validation:**
```javascript
const doctor = await validateDoctor(doctor_id);
if (!doctor) {
  return res.status(404).json({
    success: false,
    message: 'Doctor not found'
  });
}
```

**3. Appointment Service Validation (Optional):**
```javascript
if (appointment_id) {
  const appointment = await validateAppointment(appointment_id);
  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }
}
```

---

## 3. API Gateway

### Overview
Central access point untuk semua microservices. Berfungsi sebagai **routing layer** yang meneruskan request ke service yang sesuai.

### Port
`3000`

### Dependencies
```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "axios": "^1.6.0",
  "swagger-ui-express": "^5.0.0",
  "swagger-jsdoc": "^6.2.8"
}
```

### Service URLs Configuration
```javascript
const PATIENT_SERVICE_URL = 'http://localhost:3001';
const DOCTOR_SERVICE_URL = 'http://localhost:3002';
const APPOINTMENT_SERVICE_URL = 'http://localhost:3003';
const MEDICAL_RECORD_SERVICE_URL = 'http://localhost:3004';
```

### Routing Table

| Gateway Endpoint | Forwarded To | Method |
|-----------------|--------------|--------|
| `/api/patients/*` | `http://localhost:3001/patients/*` | ALL |
| `/api/doctors/*` | `http://localhost:3002/doctors/*` | ALL |
| `/api/appointments/*` | `http://localhost:3003/appointments/*` | ALL |
| `/api/records/*` | `http://localhost:3004/records/*` | ALL |
| `/api-docs` | Swagger UI | GET |
| `/api-docs.json` | OpenAPI Spec JSON | GET |

### Routing Implementation Example

**Patient Service Routing:**
```javascript
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
```

**Appointment Service Routing (with validation):**
```javascript
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
```

### Error Handling
API Gateway menangani error dari downstream services dan meneruskan status code yang sesuai:
- **404** - Resource not found
- **400** - Validation error
- **500** - Internal server error

### Root Endpoint
**GET /**
```json
{
  "message": "Smart Healthcare System API Gateway",
  "version": "1.0.0",
  "documentation": "http://localhost:3000/api-docs",
  "endpoints": {
    "patients": "http://localhost:3000/api/patients",
    "doctors": "http://localhost:3000/api/doctors",
    "appointments": "http://localhost:3000/api/appointments",
    "medical_records": "http://localhost:3000/api/records"
  }
}
```

---

## 4. Swagger Documentation

### Overview
Dokumentasi API lengkap menggunakan OpenAPI Specification 3.0 yang di-host di API Gateway.

### Access URLs
- **Swagger UI:** `http://localhost:3000/api-docs`
- **OpenAPI JSON:** `http://localhost:3000/api-docs.json`

### Configuration (swagger.js)

**OpenAPI Info:**
```javascript
{
  openapi: '3.0.0',
  info: {
    title: 'Smart Healthcare System API',
    version: '1.0.0',
    description: 'API documentation for Smart Healthcare System'
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server (API Gateway)'
    }
  ]
}
```

**Tags untuk Grouping:**
- `Patients` - Patient management endpoints
- `Doctors` - Doctor management endpoints
- `Appointments` - Appointment management endpoints
- `Medical Records` - Medical record management endpoints

### Schema Definitions

**Patient Schema:**
```javascript
Patient: {
  type: 'object',
  required: ['name', 'birth_date', 'gender', 'phone'],
  properties: {
    name: { type: 'string', example: 'John Doe' },
    birth_date: { type: 'string', example: '1990-05-15' },
    gender: { type: 'string', enum: ['male', 'female'] },
    phone: { type: 'string', example: '081234567890' },
    address: { type: 'string' },
    blood_type: { type: 'string', enum: ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'] }
  }
}
```

**Appointment Schema:**
```javascript
Appointment: {
  type: 'object',
  required: ['patient_id', 'doctor_id', 'appointment_date'],
  properties: {
    patient_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
    doctor_id: { type: 'string', example: '507f1f77bcf86cd799439012' },
    appointment_date: { type: 'string', example: '2024-11-15 10:00' },
    status: { type: 'string', enum: ['pending', 'confirmed', 'completed', 'cancelled'] },
    complaint: { type: 'string' }
  }
}
```

### JSDoc Annotations Example

```javascript
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
 *               doctor_id:
 *                 type: string
 *               appointment_date:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *       404:
 *         description: Patient or Doctor not found
 */
```

### Features
✅ Complete endpoint documentation
✅ Request/Response examples
✅ Schema definitions
✅ Try it out functionality
✅ Export to JSON

---

## 5. Frontend Dashboard

### Overview
Admin dashboard berbasis HTML, CSS, dan Vanilla JavaScript untuk manajemen semua data healthcare.

### Technology Stack
- **HTML5** - Structure
- **CSS3** - Styling with gradient background
- **Vanilla JavaScript** - Client-side logic
- **Fetch API** - HTTP requests to API Gateway

### Features

#### 1. Patients Management
- ✅ View all patients in table
- ✅ Add new patient with form validation
- ✅ Delete patient with confirmation
- ✅ Display patient details (name, birth date, gender, phone, blood type)

#### 2. Doctors Management
- ✅ View all doctors in table
- ✅ Add new doctor with schedule
- ✅ Delete doctor with confirmation
- ✅ Display doctor details (name, specialization, phone, schedule)

#### 3. Appointments Management
- ✅ View all appointments with status
- ✅ Create appointment with patient & doctor dropdown
- ✅ Status badge dengan color coding
- ✅ Delete appointment

#### 4. Medical Records Management
- ✅ View all medical records
- ✅ Add new medical record
- ✅ Link to patient, doctor, and appointment
- ✅ View detailed record information

### UI Components

**Tab Navigation:**
```javascript
function switchTab(tabName) {
  // Update tab buttons active state
  // Update tab content visibility
  // Load data for active tab
}
```

**Notification System:**
```javascript
function showNotification(message, type = 'success') {
  // Display notification with auto-hide after 3 seconds
  // Support success and error types
}
```

**API Integration:**
```javascript
const API_BASE_URL = 'http://localhost:3000/api';

async function loadPatients() {
  const response = await fetch(`${API_BASE_URL}/patients`);
  const data = await response.json();
  // Render data to table
}
```

### Form Handling

**Create Appointment Example:**
```javascript
async function addAppointment(event) {
  event.preventDefault();

  const appointmentData = {
    patient_id: document.getElementById('appointment-patient').value,
    doctor_id: document.getElementById('appointment-doctor').value,
    appointment_date: formattedDate,
    complaint: document.getElementById('appointment-complaint').value
  };

  const response = await fetch(`${API_BASE_URL}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(appointmentData)
  });

  // Handle response
}
```

### Styling Highlights

**Gradient Background:**
```css
body {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

**Status Badges:**
```css
.status-pending { background: #ffc107; }
.status-confirmed { background: #17a2b8; }
.status-completed { background: #28a745; }
.status-cancelled { background: #dc3545; }
```

**Responsive Design:**
- Mobile-friendly layout
- Flexible tables
- Adaptive forms

---

## 6. Testing Guide

### Testing Appointment Service

**Test 1: Create Appointment dengan Valid Patient & Doctor**
```bash
POST http://localhost:3003/appointments
Content-Type: application/json

{
  "patient_id": "<valid_patient_id>",
  "doctor_id": "<valid_doctor_id>",
  "appointment_date": "2024-11-15 10:00",
  "complaint": "Chest pain"
}

Expected: 201 Created
```

**Test 2: Create Appointment dengan Invalid Patient**
```bash
POST http://localhost:3003/appointments
Content-Type: application/json

{
  "patient_id": "invalid_id",
  "doctor_id": "<valid_doctor_id>",
  "appointment_date": "2024-11-15 10:00"
}

Expected: 404 Not Found - "Patient not found"
```

**Test 3: Update Appointment Status**
```bash
PUT http://localhost:3003/appointments/<appointment_id>/status
Content-Type: application/json

{
  "status": "confirmed"
}

Expected: 200 OK
```

### Testing Medical Record Service

**Test 1: Create Medical Record dengan Semua Validasi Valid**
```bash
POST http://localhost:3004/records
Content-Type: application/json

{
  "patient_id": "<valid_patient_id>",
  "doctor_id": "<valid_doctor_id>",
  "appointment_id": "<valid_appointment_id>",
  "diagnosis": "Acute coronary syndrome",
  "prescription": "Aspirin 100mg",
  "notes": "Follow up in 2 weeks"
}

Expected: 201 Created
```

**Test 2: Get Records by Patient**
```bash
GET http://localhost:3004/records/patient/<patient_id>

Expected: 200 OK with array of records
```

### Testing via API Gateway

**Test 1: Access Through Gateway**
```bash
GET http://localhost:3000/api/patients

Expected: Should forward to Patient Service and return data
```

**Test 2: Create Appointment via Gateway**
```bash
POST http://localhost:3000/api/appointments
Content-Type: application/json

{
  "patient_id": "<valid_patient_id>",
  "doctor_id": "<valid_doctor_id>",
  "appointment_date": "2024-11-15 10:00"
}

Expected: Gateway forwards to Appointment Service, which validates via Patient & Doctor services
```

### Testing Swagger UI

1. Open `http://localhost:3000/api-docs`
2. Select endpoint (e.g., POST /api/appointments)
3. Click "Try it out"
4. Fill in request body
5. Click "Execute"
6. Verify response

### Testing Frontend

1. Open `frontend/index.html` in browser
2. **Test Patients Tab:**
   - Click "Add Patient" button
   - Fill form and submit
   - Verify patient appears in table
   - Click delete and confirm

3. **Test Appointments Tab:**
   - Click "Create Appointment"
   - Select patient from dropdown
   - Select doctor from dropdown
   - Set date/time
   - Submit and verify

4. **Test Error Handling:**
   - Try creating appointment with non-existent patient
   - Should show error notification

---

## 📊 Summary

### What We Built

1. **Appointment Service** - Microservice dengan inter-service communication ke 2 services
2. **Medical Record Service** - Microservice dengan inter-service communication ke 3 services
3. **API Gateway** - Central routing dengan complete error handling
4. **Swagger Documentation** - Full API documentation dengan OpenAPI 3.0
5. **Frontend Dashboard** - Complete admin interface untuk semua CRUD operations

### Key Features

✅ **Inter-Service Communication** - Validation antar services menggunakan Axios
✅ **Complete CRUD** - Semua operasi Create, Read, Update, Delete
✅ **Error Handling** - Proper HTTP status codes dan error messages
✅ **API Documentation** - Swagger UI dengan try-it-out functionality
✅ **User Interface** - Clean, responsive dashboard
✅ **Data Validation** - Input validation di backend dan frontend

### Technologies Used

- Node.js + Express
- MongoDB + Mongoose
- Axios (HTTP client)
- Swagger UI + JSDoc
- HTML + CSS + JavaScript

---

**Documentation Version:** 1.0
**Last Updated:** October 31, 2024
