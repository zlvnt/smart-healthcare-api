# Smart Healthcare System - Technical Documentation

**UTS - Enterprise Application Integration / Web Service Development**

---

## 👥 Anggota Kelompok

| Nama | NIM | Kontribusi |
|------|-----|------------|
| Dendi Prawira | 102022330454 | Patient Service, API Gateway, Frontend |
| Haipa Zuhaira | 102022330455 | Doctor Service, API Gateway, Frontend |
| Zelvin Apri Thady | 102022330294 | Appointment Service, Medical Record Service, API Gateway, Frontend |
| Muhammad Zakiyy Mujahid | 102022330243 | API Gateway, Frontend |

---

## 📌 Ringkasan Project

**Tema:** Smart Healthcare System
**Requirement:** GraphQL Implementation & Docker Deployment
**Implementasi:**
- 3 GraphQL microservices (Patient, Doctor, Appointment)
- 1 REST microservice (Medical Record)
- API Gateway
- Frontend integration
- Docker containerization

**Database:** MongoDB Atlas
**API Types:** GraphQL (3 services) + REST (1 service)

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Backend Framework** | Node.js + Express | GraphQL & REST API services |
| **GraphQL** | express-graphql | GraphQL implementation (3 services) |
| **Database** | MongoDB Atlas | Cloud database |
| **Frontend** | HTML + CSS + Vanilla JavaScript | Admin dashboard |
| **HTTP Client** | Axios | Inter-service communication |
| **API Documentation** | Swagger UI + swagger-jsdoc | OpenAPI 3.0 documentation |
| **Containerization** | Docker & Docker Compose | Service deployment & orchestration |
| **CORS** | cors package | Cross-origin resource sharing |

---

## 🏗️ Arsitektur Sistem

### Diagram Arsitektur

```
┌─────────────────────────────────────────────────────┐
│                    Frontend                          │
│              (HTML + CSS + JS)                       │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP Request
                   ↓
┌─────────────────────────────────────────────────────┐
│              API Gateway (:3000)                     │
│          + Swagger Documentation                     │
└──┬──────────┬──────────┬──────────┬─────────────────┘
   │          │          │          │
   │ Forward  │ Forward  │ Forward  │ Forward
   ↓          ↓          ↓          ↓
┌──────┐  ┌──────┐  ┌──────────┐  ┌──────────────┐
│Patient│  │Doctor│  │Appointment│  │Medical Record│
│:3001 │  │:3002 │  │  :3003   │  │    :3004     │
└──────┘  └──────┘  └────┬─────┘  └──────┬───────┘
                         │                │
                         │ Validate       │ Validate
                         │ via HTTP       │ via HTTP
                         ↓                ↓
                    ┌────────────────────────────┐
                    │ Inter-Service Communication│
                    │  Patient & Doctor Service  │
                    └────────────────────────────┘
```

### Peran Setiap Service

| Service | Role | Port | Fungsi |
|---------|------|------|--------|
| **Patient Service** | **Provider** | 3001 | Menyediakan API untuk data pasien |
| **Doctor Service** | **Provider** | 3002 | Menyediakan API untuk data dokter |
| **Appointment Service** | **Provider & Consumer** | 3003 | Manage appointment + validasi ke Patient & Doctor |
| **Medical Record Service** | **Consumer** | 3004 | Manage rekam medis + validasi ke 3 services |
| **API Gateway** | **Gateway** | 3000 | Central routing + Swagger UI |

---

## 🔄 Inter-Service Communication

### 1. Appointment Service (Consumer ke 2 Services)

**Flow saat Create Appointment:**

```
1. Frontend → API Gateway → Appointment Service
2. Appointment Service validates:
   ├─→ HTTP GET Patient Service (/patients/:id)
   └─→ HTTP GET Doctor Service (/doctors/:id)
3. Jika valid → Save appointment
4. Jika tidak valid → Return 404 error
```

### 2. Medical Record Service (Consumer ke 3 Services)

**Flow saat Create Medical Record:**

```
1. Frontend → API Gateway → Medical Record Service
2. Medical Record Service validates:
   ├─→ HTTP GET Patient Service (/patients/:id)
   ├─→ HTTP GET Doctor Service (/doctors/:id)
   └─→ HTTP GET Appointment Service (/appointments/:id)
3. Jika semua valid → Save medical record
4. Jika ada yang tidak valid → Return 404 error
```

---

## 📡 API Endpoints Summary

### Via API Gateway (http://localhost:3000)

**Format:** Semua endpoint menggunakan JSON

| Endpoint | Method | Service Tujuan | Fungsi |
|----------|--------|----------------|--------|
| `/api/patients` | GET, POST | Patient Service | Manage data pasien |
| `/api/patients/:id` | GET, PUT, DELETE | Patient Service | CRUD individual patient |
| `/api/doctors` | GET, POST | Doctor Service | Manage data dokter |
| `/api/doctors/:id` | GET, PUT, DELETE | Doctor Service | CRUD individual doctor |
| `/api/appointments` | GET, POST | Appointment Service | Manage appointment + validasi |
| `/api/appointments/:id` | GET, DELETE | Appointment Service | CRUD individual appointment |
| `/api/appointments/:id/status` | PUT | Appointment Service | Update status appointment |
| `/api/records` | GET, POST | Medical Record Service | Manage rekam medis + validasi |
| `/api/records/:id` | GET | Medical Record Service | Get individual record |
| `/api/records/patient/:patientId` | GET | Medical Record Service | Get records by patient |

### Dokumentasi Lengkap

**Swagger UI:** `http://localhost:3000/api-docs`
**OpenAPI JSON:** `http://localhost:3000/api-docs.json`

---

## 🧪 Testing Guide

### Test Inter-Service Communication

**1. Create Patient & Doctor:**
```bash
# Create Patient
POST http://localhost:3000/api/patients
Body: {"name":"John Doe","birth_date":"1990-05-15","gender":"male","phone":"081234567890"}
→ Response: patient_id

# Create Doctor
POST http://localhost:3000/api/doctors
Body: {"name":"Dr. Jane Smith","specialization":"Cardiologist","phone":"081234567891"}
→ Response: doctor_id
```

**2. Test Appointment Validation (2 Services):**
```bash
# Valid IDs → Success
POST http://localhost:3000/api/appointments
Body: {"patient_id":"<valid_id>","doctor_id":"<valid_id>","appointment_date":"2024-11-15 10:00"}
→ Response: 201 Created ✅

# Invalid IDs → Error
POST http://localhost:3000/api/appointments
Body: {"patient_id":"invalid","doctor_id":"invalid","appointment_date":"2024-11-15 10:00"}
→ Response: 404 "Patient not found" ✅
```

**3. Test Medical Record Validation (3 Services):**
```bash
# Valid IDs → Success
POST http://localhost:3000/api/records
Body: {
  "patient_id":"<valid_id>",
  "doctor_id":"<valid_id>",
  "appointment_id":"<valid_id>",
  "diagnosis":"Test diagnosis"
}
→ Response: 201 Created ✅
```

### Test via Swagger UI

1. Buka: `http://localhost:3000/api-docs`
2. Expand endpoint (misal: POST /api/appointments)
3. Klik "Try it out"
4. Edit request body
5. Klik "Execute"
6. Lihat response

### Test via Frontend

1. Buka `frontend/index.html`
2. Tab Patients → Add patient
3. Tab Doctors → Add doctor
4. Tab Appointments → Create appointment (dropdown patient & doctor)
5. Verify data tersimpan

---

## 💾 Database Schema

**Database:** MongoDB Atlas (Dual Database Architecture)

### Database 1: healthcare_db

**Services:** Patient Service, Doctor Service, Appointment Service

### Collections (Database 1)

**patients:**
```javascript
{
  name: String,
  birth_date: String (YYYY-MM-DD),
  gender: String (male/female),
  phone: String,
  address: String,
  blood_type: String
}
```

**doctors:**
```javascript
{
  name: String,
  specialization: String,
  phone: String,
  schedule: [String]
}
```

**appointments:**
```javascript
{
  patient_id: String (reference),
  doctor_id: String (reference),
  appointment_date: String (YYYY-MM-DD HH:mm),
  status: String (pending/confirmed/completed/cancelled),
  complaint: String
}
```

### Database 2: healthcare_medical_db

**Service:** Medical Record Service

### Collections (Database 2)

**medical_records:**
```javascript
{
  patient_id: String (reference to healthcare_db.patients),
  doctor_id: String (reference to healthcare_db.doctors),
  appointment_id: String (reference to healthcare_db.appointments, optional),
  diagnosis: String,
  prescription: String,
  notes: String,
  date: Date
}
```

---

## 🔗 Inter-Database Relationships

**Architecture:**
```
┌─────────────────────────────────────┐
│      healthcare_db (MongoDB)        │
│  ├─ patients                        │
│  ├─ doctors                         │
│  └─ appointments                    │
└────────────────┬────────────────────┘
                 │
                 │ Foreign Key References
                 │
┌────────────────▼────────────────────┐
│ healthcare_medical_db (MongoDB)     │
│  └─ medical_records                 │
│     ├─ patient_id →                 │
│     ├─ doctor_id →                  │
│     └─ appointment_id →             │
└─────────────────────────────────────┘
```

**Rationale:**
- Separation of concerns: Clinical data (Patient, Doctor, Appointment) vs Medical Records
- Scalability: Medical Records can scale independently
- Data isolation: Medical Records in separate database for security/performance

---

## 🔍 GraphQL Implementation

**3 GraphQL Services:**

### Patient Service (Port 3001)
```graphql
Query:
  - patients: [Patient]
  - patient(id): Patient
  - patientByName(name): [Patient]

Mutation:
  - createPatient(nama, birth_date, gender, phone, ...): Patient
  - updatePatient(id, ...): Patient
  - deletePatient(id): Result
```

### Doctor Service (Port 3002)
```graphql
Query:
  - doctors: [Doctor]
  - doctor(id): Doctor
  - doctorBySpecialization(spec): [Doctor]

Mutation:
  - createDoctor(nama, specialization, phone, ...): Doctor
  - updateDoctor(id, ...): Doctor
  - deleteDoctor(id): Result
```

### Appointment Service (Port 3003)
```graphql
Query:
  - appointments: [Appointment]
  - appointment(id): Appointment
  - appointmentByPatient(patientId): [Appointment]
  - appointmentByDoctor(doctorId): [Appointment]

Mutation:
  - createAppointment(patient_id, doctor_id, date, complaint): Appointment
  - updateAppointmentStatus(id, status): Appointment
  - deleteAppointment(id): Result
```

**GraphQL Testing:** Open `http://localhost:<PORT>/graphql` untuk GraphQL Playground

---

## 🐳 Docker Implementation

**Services in Containers:**
- Patient Service (port 3001) - GraphQL
- Doctor Service (port 3002) - GraphQL
- Appointment Service (port 3003) - GraphQL
- Medical Record Service (port 3004) - REST
- API Gateway (port 3000) - Request routing

**Dockerfiles:** Semua services menggunakan Node.js 18 Alpine
**Networking:** Services berkomunikasi via container names dalam Docker network
**Database:** MongoDB Atlas (cloud) - tidak perlu container

---

## 🎓 Kesimpulan

Project ini mengimplementasikan **microservices architecture** dengan:

1. **3 GraphQL services** (Patient, Doctor, Appointment) dengan queries & mutations
2. **1 REST API service** (Medical Record) untuk backward compatibility
3. **Inter-service communication** via HTTP calls untuk validation
4. **API Gateway** sebagai central routing untuk GraphQL & REST
5. **Docker containerization** untuk deployment & orchestration
6. **Frontend consumer** yang memanggil services via GraphQL & REST
7. **Complete API documentation** (GraphQL examples + Swagger UI)

**Highlight:**
- Appointment Service berkomunikasi dengan **2 services** (Patient & Doctor) untuk validasi
- Medical Record Service berkomunikasi dengan **3 services** (Patient, Doctor, Appointment)
- **GraphQL Playground** tersedia di setiap service untuk testing
- **Docker networking** memungkinkan inter-service communication via container names
- **MongoDB Atlas** untuk cloud database management
